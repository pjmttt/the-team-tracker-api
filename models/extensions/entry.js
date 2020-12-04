const modelhelpers = require('../../helpers/modelhelpers');
const constants = require('../constants');
const userFormat = require('./user').format;
const Op = require('sequelize').Op;
const moment = require('moment');
const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const apihelper = require('../../helpers/apihelper');
const defaults = require('../../helpers/defaults');

async function updateSubtaskCounts(entry, user, models, transaction, req, res, previous) {
	if (req.url.indexOf('generalentries') >= 0) return;

	if (entry.entrySubtasks) {
		const userSubtasks = await models.userSubtask.findAll({
			include: [
				{
					model: models.subtask,
					as: 'subtask',
					where: { subtaskId: { [Op.in]: entry.entrySubtasks.map(es => es.subtaskId) } },
				}
			],
			where: { userId: entry.userId },
			transaction
		}).map(us => us.get());
		const statuses = await models.status.findAll({
			transaction
		});

		let sendEmails = false;
		let hasNonStatus = false;
		let hasDiff = false;

		for (let entrySubtask of entry.entrySubtasks) {
			if (!entrySubtask.statusId) {
				hasNonStatus = true;
				continue;
			}
			if (previous) {
				const prev = previous.entrySubtasks.find(st => st.subtaskId == entrySubtask.subtaskId);
				if (prev && prev.comments != entrySubtask.comments) hasDiff = true;
				if (prev && prev.statusId == entrySubtask.statusId) continue;
			}

			hasDiff = true;

			const status = statuses.find(s => s.statusId == entrySubtask.statusId);
			if ((status.notifyManagerAfter || 0) < 1) continue;

			let userSubtask = userSubtasks.find(us => us.statusId == entrySubtask.statusId && us.subtaskId == entrySubtask.subtaskId);
			if (!userSubtask) {
				userSubtask = {
					subtaskId: entrySubtask.subtaskId,
					userId: entry.userId,
					statusId: entrySubtask.statusId,
					entrySubtaskIds: [],
				}
				userSubtasks.push(userSubtask);
			}
			else if (!userSubtask.entrySubtaskIds) {
				userSubtask.entrySubtaskIds = [];
			}
			userSubtask.entrySubtaskIds.push(entrySubtask.entrySubtaskId);
			sendEmails = true;
		}

		for (let userSubtask of userSubtasks) {
			userSubtask.updatedBy = user.email;
			if (userSubtask.userSubtaskId) {
				await models.userSubtask.update(userSubtask, {
					fields: Object.keys(userSubtask),
					transaction,
					where: { userSubtaskId: userSubtask.userSubtaskId }
				});
			}
			else {
				await models.userSubtask.create(userSubtask, { transaction });
			}
		}

		if (sendEmails) await sendUserSubtaskEmails(models, transaction);
		// if (!hasNonStatus && hasDiff) await sendEntriesForIds([entry.entryId], models, transaction);
	}
}

async function sendUserSubtaskEmails(models, transaction) {
	const userSubtasks = await models.userSubtask.findAll({
		include: [
			{
				model: models.subtask,
				as: 'subtask',
				include: { model: models.task, as: 'task', paranoid: false },
				paranoid: false
			},
			{
				model: models.status,
				as: 'status',
				include: [
					{ model: models.emailTemplate, as: 'managerEmailTemplate', paranoid: false },
				],
				where: {
					notifyManagerAfter: { [Op.gt]: 0 }
				},
				paranoid: false
			}
		],
		transaction
	});

	const userQueue = [];
	for (let userSubtask of userSubtasks) {
		if (!userSubtask.entrySubtaskIds) continue;
		if (parseFloat(userSubtask.entrySubtaskIds.length) / parseFloat(userSubtask.status.notifyManagerAfter) >= 1) {
			// const entrySubtasks = await models.entrySubtask.findAll({
			// 	include: { model: models.entry, as: 'entry', paranoid: false },
			// 	where: { entrySubtaskId: { [Op.in]: userSubtask.entrySubtaskIds } }
			// });

			const user = await models.user.findById(userSubtask.userId, { paranoid: false, transaction });
			let queue = userQueue.find(q => q.user.userId == user.userId && q.status.statusId == userSubtask.statusId, {
				transaction
			});
			if (!queue) {
				queue = {
					user,
					status: userSubtask.status,
					userSubtasks: []
				};
				userQueue.push(queue);
			}

			queue.userSubtasks.push(userSubtask);
		}
	}

	for (let q of userQueue) {
		const emailTemplate = q.status.managerEmailTemplate;
		let subject = emailTemplate.subject;
		subject = subject.replace(/\[Employee\]/g, `${userhelper.getDisplayName(q.user)}`);

		let html = emailTemplate.body;
		html = html.replace(/\[Employee\]/g, `${userhelper.getDisplayName(q.user)}`);

		let htmlTbl = '<table>';
		for (let userSubtask of q.userSubtasks) {
			htmlTbl += `<tr><td>${userSubtask.subtask.task.taskName} - ${userSubtask.subtask.subtaskName}</td></tr>`;
		}
		htmlTbl += '</table>';
		html = html.replace(/\[Subtasks\]/g, htmlTbl);

		await emailhelper.sendNotification(models, constants.ROLE.MANAGER, q.user, subject, html);
		for (let userSubtask of q.userSubtasks) {
			await models.userSubtask.destroy({ where: { userSubtaskId: userSubtask.userSubtaskId }, force: true, transaction });
		}
	}
}

async function creating(entry, user, models, transaction, req, res) {
	await checkHasAllSubtasks(entry, entry.taskId, models);
	entry.entryType = req.url.indexOf('generalentries') >= 0 ? 1 : 0;
}

async function updateUserScore(entry, models, transaction, req, res, previousRating) {
	if (entry.entryType == 1 && entry.userId && entry.taskId && entry.rating != null && entry.rating != undefined) {
		const task = await models.task.findById(entry.taskId, {
			transaction,
			paranoid: true
		});
		if (task.difficulty) {
			const user = await models.user.findById(entry.userId, { transaction });
			await models.user.update({
				runningScore: user.runningScore + ((entry.rating - previousRating) * task.difficulty)
			}, {
					field: ['runningScore'],
					transaction,
					where: { userId: entry.userId }
				});
		}
	}
}

async function created(entry, user, models, transaction, req, res) {
	if (entry.shiftId) {
		// await models.userEntryQueue.create({
		// 	entryId: entry.entryId,
		// }, {
		// 		transaction
		// 	});

		await updateSubtaskCounts(entry, user, models, transaction, req, res);
	}
	await updateUserScore(entry, models, transaction, req, res, 0);
}

async function updating(id, prev, item, user, models, transaction, req, res) {
	await checkHasAllSubtasks(item, item.taskId || prev.taskId, models);
	prev.entrySubtasks = (await models.entrySubtask.findAll({
		where: { entryId: id },
		transaction
	})).map(st => st.get());
}

async function updated(id, entry, previous, user, models, transaction, req, res, bulk) {
	if (entry.shiftId) {
		// const currQueue = await models.userEntryQueue.findOne({ where: { entryId: entry.entryId }, transaction });
		// if (!currQueue) {
		// 	await models.userEntryQueue.create({
		// 		entryId: entry.entryId,
		// 		userId: entry.userId,
		// 	}, {
		// 			transaction
		// 		});
		// }
		await updateSubtaskCounts(entry, user, models, transaction, req, res, previous);
	}
	await updateUserScore(entry, models, transaction, req, res, previous.rating || 0);
}

async function checkHasAllSubtasks(entry, taskId, models) {
	if (taskId && entry.entrySubtasks) {
		const task = await models.task.findById(taskId, {
			include: [{
				model: models.subtask, as: 'subtasks'
			}],
			paranoid: false
		})

		if (task) {
			for (let st of task.subtasks) {
				if (!entry.entrySubtasks.some(es => es.subtaskId == st.subtaskId)) {
					entry.entrySubtasks.push({
						entryId: entry.entryId,
						subtaskId: st.subtaskId,
					});
				}
			}
		}
	}
}

function getWhere(req, res) {
	if (req.query.extras) {
		return {
			entryType: 1,
			entryDate: null,
			userId: null,
		}
	}
	if (!req.query.start || !req.query.end)
		throw new Error("_400_Start and end required!");

	let end = moment(req.query.end);
	end.add(1, 'd');

	const and = [{
		entryDate: { [Op.gte]: moment(req.query.start).format("YYYY-MM-DD") }
	},
	{
		entryDate: { [Op.lt]: end.format("YYYY-MM-DD") }
	},
	{
		entryType: req.url.indexOf('generalentries') < 0 ? 0 : 1
	}];

	if (req.query.forUser) {
		and.push({ userId: res.locals.user.userId });
	}
	else if (res.locals.user.roles.indexOf(constants.ROLE.MANAGER.value) < 0 && res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}

	return {
		[Op.and]: and
	}
}

function format(entry, req, res, model) {
	if (entry.user) {
		if (entry.user.get) entry.user = entry.user.get();
		entry.user = userFormat(entry.user, req, res, model);
	}
	if (entry.enteredBy) {
		if (entry.enteredBy.get) entry.enteredBy = entry.enteredBy.get();
		entry.enteredBy = userFormat(entry.enteredBy, req, res, model);
	}
	if (entry.entrySubtasks) {
		for (let es of entry.entrySubtasks) {
			if (es.enteredBy) {
				if (es.enteredBy.get) es.enteredBy = es.enteredBy.get();
				es.enteredBy = userFormat(es.enteredBy, req, res, model);
			}
		}
	}
	return entry;
}

function getIncludes(models, req, res) {
	let includes = [
		{ model: models.task, as: 'task', paranoid: false },
		{ model: models.user, as: 'user', paranoid: false },
		{ model: models.user, as: 'enteredBy', paranoid: false },
	];

	if (req.url.indexOf('generalentries') < 0) {
		includes = includes.concat([
			{ model: models.shift, as: 'shift', paranoid: false },
			{
				model: models.entrySubtask,
				as: 'entrySubtasks',
				include: [
					{ model: models.subtask, as: 'subtask', paranoid: false },
					{ model: models.status, as: 'status', paranoid: false },
					{ model: models.user, as: 'enteredBy', paranoid: false }
				],
				separate: true,
			}
		]);
	}

	return includes;
}

async function searchEntries(models, searchParams, req, res) {
	const where = { companyId: res.locals.user.companyId };
	let end = new Date(req.query.end);
	end.setDate(end.getDate() + 1);

	const dateAnd = [];
	if (searchParams.endDate) {
		end = new Date(searchParams.endDate);
		end.setDate(end.getDate() + 1);
		dateAnd.push({ entryDate: { [Op.lt]: end } });
	}
	if (searchParams.startDate) {
		dateAnd.push({ entryDate: { [Op.gte]: new Date(searchParams.startDate) } });
	}
	if (dateAnd.length > 0) {
		where.$and = dateAnd;
	}
	where.entryType = searchParams.entryType || 0;
	if (searchParams.users && searchParams.users.length > 0) {
		where.userId = { [Op.in]: searchParams.users };
	}
	if (searchParams.shifts && searchParams.shifts.length > 0) {
		where.shiftId = { [Op.in]: searchParams.shifts };
	}
	if (searchParams.tasks && searchParams.tasks.length > 0) {
		where.taskId = { [Op.in]: searchParams.tasks };
	}
	if (searchParams.notesOnly) {
		where.notes = { [Op.ne]: null }
	}

	const include = getIncludes(models, req, res);

	const { limit, offset, order } = apihelper.getLimitOffsetOrder(req, include);

	const results = await models.entry.findAndCountAll({
		where,
		include,
		limit,
		offset,
		order
	})

	return {
		data: results.rows.map(e => modelhelpers.getFormattedResult(e, models.entry, req, res)),
		count: results.count
	};
}

async function pickupEntry(models, entry, req, res) {
	const curr = await models.entry.findById(req.body.entryId);
	if (curr.userId || curr.entryDate || curr.entryType != 1) {
		throw new Error('_400_Cannot select this task');
	}
	await models.entry.update({
		userId: res.locals.user.userId,
		entryDate: new Date()
	}, {
			where: { entryId: req.body.entryId },
			fields: ['userId', 'entryDate']
		})
}

async function sendEntries(models, req, res) {
	await sendEntriesForIds(req.body.entryIds, models);
}

async function sendEntriesForIds(ids, models, transaction) {
	const entries = await models.entry.findAll({
		where: {
			entryId: {
				$in: ids
			}
		},
		transaction,
		include: [{
			model: models.entrySubtask,
			as: 'entrySubtasks',
			include: [
				{ model: models.subtask, as: 'subtask', paranoid: false },
				{ model: models.status, as: 'status', paranoid: false }
			]
		}, {
			model: models.user,
			as: 'user',
			paranoid: false,
			include: [
				{
					model: models.cellPhoneCarrier,
					as: 'cellPhoneCarrier',
					paranoid: false,
				},
			]
		}, {
			model: models.user,
			as: 'enteredBy',
			paranoid: false,
		}, {
			model: models.task,
			as: 'task',
			paranoid: false,
		}, {
			model: models.shift,
			as: 'shift',
			paranoid: false,
		}, {
			model: models.company,
			as: 'company',
			paranoid: false,
			include: [
				{ model: models.emailTemplate, as: 'emailTemplates', where: { templateType: 0 } }
			]
		}]
	});

	const userEntries = [];
	for (let e of entries) {
		if (!e.user) continue;

		let userEntry = userEntries.find(ue => ue.user && ue.user.userId == e.userId);
		if (!userEntry) {
			userEntry = {
				user: e.user,
				entries: [],
			}
			userEntries.push(userEntry);
		}
		userEntry.entries.push(e);
	}

	for (let userEntry of userEntries) {
		await sendEntrysEmail(models, userEntry);
	}
}

async function sendEntrysEmail(models, userEntry) {
	const company = userEntry.entries[0].company;
	const user = userEntry.user;
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.user, company.companyId, user.userId || 'NONE');
	let subject = emailTemplate.subject;
	subject = subject.replace(/\[Employee\]/g, user);

	let html = emailTemplate.body;
	html = html.replace(/\[Employee\]/g, user);

	let htmlTbl = '<table>';
	for (let entry of userEntry.entries) {
		if (entry.shiftId) {
			htmlTbl += `<tr><td colspan="2">${entry.entryDate ? moment(entry.entryDate).format("L") : ''} - ${entry.shift.shiftName} - ${entry.task.taskName} - ${userhelper.getDisplayName(entry.enteredBy)}${entry.comments ? `: ${entry.comments}` : ''}</td></tr>
			`;
			for (let st of entry.entrySubtasks) {
				if (!st.status) continue;
				htmlTbl += `<tr><td style='width: 60px'></td><td>${st.subtask.subtaskName} - ${st.status.statusName}${st.comments ? `: ${st.comments}` : ''}</td></tr>
				`;
			}
			htmlTbl += `<tr><td colspan="2">&nbsp;</td></tr>`;
		}
	}
	htmlTbl += '</table>';
	html = html.replace(/\[Entries\]/g, htmlTbl);

	let bodyText = emailTemplate.bodyText || h2p(emailTemplate.body || '');
	let lines = '';
	for (let entry of userEntry.entries) {
		if (entry.shiftId) {
			lines += `${entry.shift.shiftName} - ${entry.task.taskName} - ${userhelper.getDisplayName(entry.enteredBy)}${entry.comments ? `: ${entry.comments}` : ''}
	`;
			for (let st of entry.entrySubtasks) {
				if (!st.status) continue;
				lines += `	${st.subtask.subtaskName} - ${st.status.statusName}${st.comments ? `: ${st.comments}` : ''}
	`;
			}
		}
	}
	bodyText = bodyText.replace(/\[Entries\]/g, lines);

	if (userEntry.user.enableEmailNotifications && userEntry.user.emailNotifications.indexOf(constants.NOTIFICATION.DAILY_REPORT.value) >= 0) {
		await emailhelper.sendEmail([userEntry.user.email], subject, html, null, true);
	}
	if (userEntry.user.enableTextNotifications && userEntry.user.phoneNumber && userEntry.user.cellPhoneCarrier &&
		userEntry.user.textNotifications.indexOf(constants.NOTIFICATION.DAILY_REPORT.value) >= 0) {
		await emailhelper.sendEmail([`${user.phoneNumber.replace(/\D/g, '')}@${user.cellPhoneCarrier.domain}`], '', bodyText, null, true, true);
	}
}

module.exports = {
	saveChildren: ['entrySubtasks'],
	deleteChildren: ['entrySubtasks'],
	creating,
	created,
	getWhere,
	getIncludes,
	format,
	searchEntries,
	pickupEntry,
	sendEntries,
	updating,
	updated
}