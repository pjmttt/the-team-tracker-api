const constants = require('../constants');
const userFormat = require('./user').format;
const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const schedFormat = require('./schedule').format;
const sequelize = require('sequelize');
const localdate = require('../../utils/dateutils').localdate;
const h2p = require('html2plaintext');
const defaults = require('../../helpers/defaults');

function format(sched, req, res, model) {
	if (sched.schedule) {
		sched.schedule = schedFormat(sched.schedule, req, res, model);
	}
	if (sched.tradeForSchedule) {
		sched.tradeForSchedule = schedFormat(sched.tradeForSchedule, req, res, model);
	}
	if (sched.tradeUser) {
		if (sched.tradeUser.get) sched.tradeUser = sched.tradeUser.get();
		sched.tradeUser = userFormat(sched.tradeUser, req, res, model);
	}
	return sched;
}

function getScheduleText(schedule, isForText, company) {
	if (!schedule) return '';
	const local = localdate(schedule.scheduleDate, company);
	return `${local.format("dddd")}, ${local.format("L")}: ${localdate(schedule.startTime, company).format("LT")} - ${localdate(schedule.endTime, company).format("LT")}${isForText ? `
	`: '<br />'}${schedule.shift.shiftName} - ${schedule.task.taskName}`;
}

function replaceTemplate(tradeRequest, raw, employee, approvedDeniedBy, isForText, company) {
	return raw.replace(/\[ApprovedDeniedDate\]/, localdate(null, company).format('L'))
		.replace(/\[Status\]/, Object.keys(constants.TRADE_STATUS).map(k => constants.TRADE_STATUS[k]).find(s => s.value == tradeRequest.tradeStatus).label)
		.replace(/\[Employee\]/, userhelper.getDisplayName(employee || tradeRequest.schedule.user))
		.replace(/\[ToEmployee\]/, userhelper.getDisplayName(tradeRequest.schedule.user))
		.replace(/\[Schedule\]/, getScheduleText(tradeRequest.schedule, isForText, company))
		.replace(/\[FromSchedule\]/, getScheduleText(tradeRequest.schedule, isForText, company))
		.replace(/\[ToSchedule\]/, getScheduleText(tradeRequest.tradeForSchedule, isForText, company))
		.replace(/\[Comments\]/, tradeRequest.comments)
		.replace(/\[ApprovedDeniedBy\]/, approvedDeniedBy ? userhelper.getDisplayName(approvedDeniedBy) : '');
}

async function sendTradePostedEmail(models, request, user) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.scheduleTradePost, user.companyId, user.userId);
	const scheduleTrade = await models.scheduleTrade.findById(request.scheduleTradeId, {
		include: getIncludes(models)
	});

	const subject = replaceTemplate(scheduleTrade, emailTemplate.subject, user, null, null, user.company);
	const html = replaceTemplate(scheduleTrade, emailTemplate.body, user, null, null, user.company);
	const bodyText = replaceTemplate(scheduleTrade, emailTemplate.bodyText || h2p(emailTemplate.body), user, null, true, user.company);

	const usersToSendTo = await models.user.findAll({
		include: {
			model: models.cellPhoneCarrier, as: 'cellPhoneCarrier'
		},
		where: {
			companyId: user.companyId,
			isFired: false,
		}
	});

	await emailhelper.sendEmail(
		usersToSendTo
			.filter(u => u.enableEmailNotifications && u.emailNotifications.indexOf(constants.NOTIFICATION.TRADE_REQUESTS.value) >= 0)
			.map(u => u.email),
		subject, html, user.email, true);

	await emailhelper.sendEmail(
		usersToSendTo
			.filter(u => u.enableTextNotifications && u.textNotifications.indexOf(constants.NOTIFICATION.TRADE_REQUESTS.value) >= 0)
			.map(u => `${u.phoneNumber.replace(/\D/g, '')}@${u.cellPhoneCarrier.domain}`),
		null, bodyText, user.email, true, true);
}

async function sendEmail({ toUser, from, emailTemplate, item, employee, approvedDeniedBy, company }) {
	await emailhelper.sendEmail([toUser.email],
		replaceTemplate(item, emailTemplate.subject, employee, approvedDeniedBy, null, company),
		replaceTemplate(item, emailTemplate.body, employee, approvedDeniedBy, null, company),
		from, false, false
	);
	if (toUser.phoneNumber && toUser.cellPhoneCarrier) {
		await emailhelper.sendEmail([`${toUser.phoneNumber.replace(/\D/g, '')}@${toUser.cellPhoneCarrier.domain}`],
			replaceTemplate(item, emailTemplate.subject, employee, approvedDeniedBy, true, company),
			replaceTemplate(item, emailTemplate.bodyText || h2p(emailTemplate.body), employee, approvedDeniedBy, true, company),
			from, false, true
		);
	}
}

async function sendTradeRequestedEmail(models, request, user) {
	const scheduleTrade = await models.scheduleTrade.findById(request.scheduleTradeId, {
		include: getIncludes(models, true),
	});

	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.scheduleTradeRequest, user.companyId, user.userId);
	await sendEmail({
		toUser: scheduleTrade.schedule.user,
		from: scheduleTrade.tradeUser.email,
		emailTemplate,
		item: scheduleTrade,
		employee: scheduleTrade.tradeUser,
		company: user.company
	});
}


async function sendDeclinedEmail(models, request, user, toUser) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.scheduleTradeDeclined, user.companyId, user.userId);
	const scheduleTrade = await models.scheduleTrade.findById(request.scheduleTradeId, {
		include: getIncludes(models, true),
	});

	await sendEmail({
		toUser,
		from: user.email,
		emailTemplate,
		item: scheduleTrade,
		employee: user,
		company: user.company
	});
}

async function sendApprovedDeniedEmail(models, request, user, origUser) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.scheduleTradeResponse, user.companyId, user.userId);
	const scheduleTrade = await models.scheduleTrade.findById(request.scheduleTradeId, {
		include: getIncludes(models, true),
	});

	if (origUser)
		await sendEmail({
			toUser: origUser,
			from: user.email,
			emailTemplate,
			item: scheduleTrade,
			approvedDeniedBy: user,
			company: user.company
		});
	await sendEmail({
		toUser: scheduleTrade.tradeUser,
		from: user.email,
		emailTemplate,
		item: scheduleTrade,
		approvedDeniedBy: user,
		company: user.company
	});

	await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
		replaceTemplate(scheduleTrade, emailTemplate.subject, scheduleTrade.tradeUser, user, false, user.company),
		replaceTemplate(scheduleTrade, emailTemplate.body, scheduleTrade.tradeUser, user, false, user.company),
		replaceTemplate(scheduleTrade, emailTemplate.bodyText || h2p(emailTemplate.body), scheduleTrade.tradeUser, user, true, user.company)
	);
}

async function sendPendingEmail(models, request, user) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.scheduleTradePendingApproval, user.companyId, user.userId);
	const scheduleTrade = await models.scheduleTrade.findById(request.scheduleTradeId, {
		include: getIncludes(models, true),
	});

	await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
		replaceTemplate(scheduleTrade, emailTemplate.subject, user, null, false, user.company),
		replaceTemplate(scheduleTrade, emailTemplate.body, user, null, false, user.company),
		replaceTemplate(scheduleTrade, emailTemplate.bodyText || h2p(emailTemplate.body), user, null, true, user.company)
	);
}

// async function created(scheduleTrade, user, models, transaction, req, res) {
// 	await sendTradePostedEmail(models, scheduleTrade, user, transaction);

// }

// async function updated(id, scheduleTrade, previous, user, models, transaction, req, res, bulk) {
// if (scheduleTrade.tradeStatus != previous.tradeStatus) {
// 	if (scheduleTrade.tradeStatus == constants.TRADE_STATUS.REQUESTED.value) {
// 		await sendTradeRequestedEmail(models, scheduleTrade, user, transaction);
// 	}
// 	else if (scheduleTrade.tradeStatus == constants.TRADE_STATUS.PENDING_APPROVAL.value) {
// 		await sendPendingEmail(models, scheduleTrade, user, transaction);
// 	}
// 	else if (scheduleTrade.tradeStatus == constants.TRADE_STATUS.APPROVED.value || scheduleTrade.tradeStatus == constants.TRADE_STATUS.DENIED.value) {
// 		await sendApprovedDeniedEmail(models, scheduleTrade, user, transaction);
// 	}
// 	else if (scheduleTrade.tradeStatus == constants.TRADE_STATUS.SUBMITTED.value) {
// 		await sendDeclinedEmail(models, scheduleTrade, user, transaction);
// 	}
// }
// }

async function deleting(id, user, models) {
	const scheduleTrade = await models.scheduleTrade.findById(id, {
		include: {
			model: models.schedule,
			as: 'schedule',
		}
	});

	const sched = scheduleTrade.schedule;
	if (user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 && user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (!sched.userId || (sched.userId && sched.userId != user.userId)) {
			throw new Error('_409_Cannot delete this trade.');
		}
	}
}

async function postTrade(scheduleId, user, models, req, res) {
	const sched = await models.schedule.findById(scheduleId, {
		include: {
			model: models.scheduleTrade,
			as: 'scheduleTrades',
		}
	});
	if ((!sched.userId && user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 && user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) ||
		(sched.userId && sched.userId != user.userId)) {
		throw new Error('_409_Cannot trade this schedule.');
	}
	if (sched.scheduleTrades.length > 0) throw new Error('_409_Schedule already marked for trade.');

	const scheduleTrade = await models.scheduleTrade.create({
		scheduleId,
		tradeStatus: constants.TRADE_STATUS.SUBMITTED.value
	});

	try {
		await sendTradePostedEmail(models, scheduleTrade, user);
	}
	catch (e) {
		// TODO:
	}
	return Promise.resolve(format(scheduleTrade, req, res, models.scheduleTrade));
}

async function requestTrade(scheduleTradeId, tradeForScheduleId, user, models) {
	const scheduleTrade = await models.scheduleTrade.findById(scheduleTradeId, {
		include: {
			model: models.schedule, as: 'schedule'
		}
	});
	const updated = await models.scheduleTrade.update({
		tradeForScheduleId,
		tradeStatus: scheduleTrade.schedule.userId ? constants.TRADE_STATUS.REQUESTED.value : constants.TRADE_STATUS.PENDING_APPROVAL.value,
		tradeUserId: user.userId
	}, {
			where: {
				scheduleTradeId
			}
		});

	try {
		if (scheduleTrade.schedule.userId) {
			await sendTradeRequestedEmail(models, scheduleTrade, user);
		}
		else {
			await sendPendingEmail(models, scheduleTrade, user);
		}
	}
	catch (e) {
		// TODO:
	}
}

async function acceptDeclineTrade(scheduleTradeId, accept, comments, user, models) {
	const scheduleTrade = await models.scheduleTrade.findById(scheduleTradeId, {
		include: [{
			model: models.schedule, as: 'schedule'
		}, {
			model: models.user,
			as: 'tradeUser',
			include: {
				model: models.cellPhoneCarrier,
				as: 'cellPhoneCarrier',
			}
		}]
	});

	if (scheduleTrade.schedule.userId && scheduleTrade.schedule.userId != user.userId) {
		throw new Error(`_409_Cannot accept someone else's trade.`);
	}

	const body = {
		tradeStatus: accept ? constants.TRADE_STATUS.PENDING_APPROVAL.value : constants.TRADE_STATUS.SUBMITTED.value,
		comments,
	};

	if (!accept) {
		body.tradeForScheduleId = null;
		body.tradeUserId = null;
	}

	const updated = await models.scheduleTrade.update(body, {
		where: {
			scheduleTradeId
		}
	});

	try {
		if (accept) {
			await sendPendingEmail(models, scheduleTrade, user);
		}
		else {
			await sendDeclinedEmail(models, scheduleTrade, user, scheduleTrade.tradeUser);
		}
	}
	catch (e) {
		// TODO:
	}
}

async function approveDenyTrade(scheduleTradeId, approve, comments, user, models) {
	const scheduleTrade = await models.scheduleTrade.findById(scheduleTradeId, {
		include: {
			model: models.schedule,
			as: 'schedule',
			include: {
				model: models.user,
				as: 'user',
				include: {
					model: models.cellPhoneCarrier,
					as: 'cellPhoneCarrier'
				}
			}
		}
	});

	const origUser = scheduleTrade.schedule.user;

	scheduleTrade.tradeStatus = approve ? constants.TRADE_STATUS.APPROVED.value : constants.TRADE_STATUS.DENIED.value;
	const updated = await models.scheduleTrade.update({
		tradeStatus: scheduleTrade.tradeStatus,
		comments,
	}, {
			where: {
				scheduleTradeId
			}
		});

	if (approve) {
		if (scheduleTrade.tradeForScheduleId) {
			await models.schedule.update({
				userId: scheduleTrade.schedule.userId
			}, {
					where: { scheduleId: scheduleTrade.tradeForScheduleId }
				});
		}

		await models.schedule.update({
			userId: scheduleTrade.tradeUserId
		}, {
				where: { scheduleId: scheduleTrade.scheduleId }
			});
	}

	try {
		await sendApprovedDeniedEmail(models, scheduleTrade, user, origUser);
	}
	catch (e) {
		// TODO:
	}

}

function getWhere(req, res) {
	const where = {
		'$schedule.company_id$': res.locals.user.companyId,
		'$schedule.deleted_at$': null
	};

	if (req.query.start || req.query.end) {
		where.$and = [];
		if (req.query.start) {
			where.$and.push({ '$schedule.schedule_date$': { [sequelize.Op.gte]: new Date(req.query.start) } });
		}
		if (req.query.end) {
			let end = new Date(req.query.end);
			end.setDate(end.getDate() + 1);
			where.$and.push({ '$schedule.schedule_date$': { [sequelize.Op.lt]: end } });
		}
	}

	if (req.query.forUser) {
		const useror = [];
		useror.push({
			'$schedule.user_id$': res.locals.user.userId
		});

		useror.push({
			trade_user_id: res.locals.user.userId
		});
		where.$or = useror;
	}

	if (req.query.status) {
		where.tradeStatus = req.query.status;
	}

	return where;
}

function getIncludes(models, andCarrier) {
	const userInclude = [
		{
			model: models.position,
			as: 'position',
			paranoid: false,
		}
	];
	if (andCarrier) {
		userInclude.push({
			model: models.cellPhoneCarrier,
			as: 'cellPhoneCarrier',
			paranoid: false
		});
	}
	const includes = [{
		model: models.schedule,
		as: 'schedule',
		paranoid: false,
		include: [
			{ model: models.task, as: 'task', paranoid: false },
			{
				model: models.user,
				as: 'user',
				paranoid: false,
				include: userInclude.map(i => Object.assign({}, i)),
			},
			{ model: models.shift, as: 'shift', paranoid: false },
		]
	}, {
		model: models.schedule,
		as: 'tradeForSchedule',
		paranoid: false,
		include: [
			{ model: models.task, as: 'task', paranoid: false },
			{
				model: models.user,
				as: 'user',
				paranoid: false,
				include: userInclude.map(i => Object.assign({}, i)),
			},
			{ model: models.shift, as: 'shift', paranoid: false },
		]
	}, {
		model: models.user,
		as: 'tradeUser',
		paranoid: false,
		include: userInclude.map(i => Object.assign({}, i)),
	}];

	return includes;
}

module.exports = {
	getWhere,
	getIncludes,
	format,
	postTrade,
	requestTrade,
	acceptDeclineTrade,
	approveDenyTrade,
	deleting,
	// updated,
	// created,
}