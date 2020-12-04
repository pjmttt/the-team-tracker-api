const constants = require('../constants');
const userFormat = require('./user').format;
const moment = require('moment');
const Op = require('sequelize').Op;
const emailhelper = require('../../helpers/emailhelper');
const modelhelpers = require('../../helpers/modelhelpers');
const defaults = require('../../helpers/defaults');

function format(sched, req, res, model) {
	if (sched.user) {
		if (sched.user.get) sched.user = sched.user.get();
		sched.user = userFormat(sched.user, req, res, model);
	}
	return sched;
}

function getWhere(req, res) {
	if (!req.query.start || !req.query.end)
		throw new Error("_400_Start and end required!");

	let end = new Date(req.query.end);
	end.setDate(end.getDate() + 1);

	const and = [{
		scheduleDate: { [Op.gte]: new Date(req.query.start) }
	},
	{
		scheduleDate: { [Op.lt]: end }
	}];

	if (req.query.forUser) {
		and.push({ userId: res.locals.user.userId });
		and.push({ published: true });
	}
	else if (req.query.assigned) {
		and.push({ userId: { [Op.ne]: null } });
		and.push({ published: true });
	}
	else if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 && res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}

	return {
		[Op.and]: and
	}
}

// async function created(schedule, user, models, transaction, req, res) {
// 	if (schedule.published) {
// 		req.body.scheduleIds = [schedule.scheduleId];
// 		await sendSchedules(req, res, models, transaction);
// 		req.body.isText = true;
// 		await sendSchedules(req, res, models, transaction);
// 	}
// }

// async function updated(id, schedule, previous, user, models, transaction, req, res, bulk) {
// 	if (schedule.published) {
// 		req.body.scheduleIds = [schedule.scheduleId];
// 		await sendSchedules(req, res, models, transaction);
// 		req.body.isText = true;
// 		await sendSchedules(req, res, models, transaction);
// 	}
// }

function getIncludes(models, req, res) {
	let includes = [
		{ model: models.task, as: 'task', paranoid: false },
		{
			model: models.user, as: 'user',
			paranoid: false,
			include: {
				model: models.position,
				as: 'position',
				paranoid: false,
			}
		},
		{ model: models.shift, as: 'shift', paranoid: false },
	];

	const tradeInclude = {
		model: models.scheduleTrade,
		as: 'scheduleTrades',
	};

	if (req.query.forUser) {
		tradeInclude.include = {
			model: models.schedule,
			as: 'tradeForSchedule',
			include: [
				{ model: models.task, as: 'task', paranoid: false },
				{
					model: models.user, as: 'user',
					paranoid: false,
					include: {
						model: models.position,
						as: 'position',
						paranoid: false,
					}
				},
				{ model: models.shift, as: 'shift', paranoid: false },
			]
		};
	}

	includes.push(tradeInclude);


	return includes;
}

async function schedulesFromTemplate(templateId, forDate, req, res, models) {
	const transaction = await models.db.transaction();
	try {
		const schedules = await models.schedule.findAll({
			where: { scheduleTemplateId: req.params.id },
			include: { model: models.user, as: 'user', paranoid: false },
			transaction
		});
		const newSchedules = [];
		for (let s of schedules) {
			if (s.user && (s.user.isFired || s.user.deleted_at)) continue;

			let newSched = Object.assign({}, s.get());
			let schedDate = moment(forDate);
			while (schedDate.day() != s.dayOfWeek) {
				schedDate.add(1, 'd');
			}

			newSched.scheduleDate = moment(schedDate).toDate();

			// const curr = await models.schedule.findOne({
			// 	where: {
			// 		scheduleTemplateId: req.params.id,
			// 		scheduleDate: newSched.scheduleDate
			// 	}
			// });

			// if (curr) continue;

			delete newSched.scheduleId;
			delete newSched.scheduleTemplateId;
			newSched.published = false;
			newSchedules.push(newSched);
		}
		await models.schedule.bulkCreate(newSchedules, { transaction });
		await transaction.commit();
	}
	catch (e) {
		await transaction.rollback();
		throw e;
	}
}

async function schedulesFromPrevious(forDate, req, res, models) {
	const start = moment(forDate);
	while (start.day() != res.locals.user.company.weekStart) {
		start.date(start.date() - 1);
	}
	start.date(start.date() - 7);
	const end = moment(start);
	end.date(end.date() + 6);
	return await models.db.query(`
	insert into "schedule" (schedule_date, company_id, shift_id, user_id, task_id, start_time, end_time, created_at, updated_at, updated_by, day_of_week, notes, published)
	select s.schedule_date + interval '7 day', s.company_id, shift_id, s.user_id, task_id, start_time, end_time, now(), now(), '${res.locals.user.email}', day_of_week, s.notes, false
	from schedule s
	left join "user" u on u.user_id = s.user_id
	where s.schedule_date is not null and s.deleted_at is null and u.deleted_at is null and (u.is_fired is null or u.is_fired <> TRUE)
		and s.schedule_date between '${start.format("YYYY-MM-DD")}' and '${end.format("YYYY-MM-DD")} 23:59:59.999' and s.company_id = '${res.locals.user.companyId}'
	`);

}


async function sendSchedules(req, res, models, transaction) {
	const template = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.schedule, res.locals.user.companyId, res.locals.user.userId);
	const schedules = await models.schedule.findAll({
		where: {
			scheduleId: {
				[Op.in]: req.body.scheduleIds
			},
			userId: { $ne: null },
			published: true,
		},
		include: [
			{ model: models.task, as: 'task', paranoid: false },
			{ model: models.shift, as: 'shift', paranoid: false },
			{
				model: models.user, as: 'user', paranoid: false,
				include: {
					model: models.cellPhoneCarrier, as: 'cellPhoneCarrier', paranoid: false
				}
			}
		],
		order: [
			['scheduleDate', 'ASC']
		],
		transaction
	});
	const formatted = schedules.map(s => modelhelpers.getFormattedResult(s, models.schedule, req, res));
	await emailhelper.sendScheduleEmails(formatted, template, req.body.isText, res);
}

async function publishSchedules(req, res, models) {
	await models.schedule.update({
		published: true
	}, {
			where: {
				scheduleId: {
					[Op.in]: req.body.scheduleIds
				},
				userId: { $ne: null }
			},
			fields: ['published']
		});
	await sendSchedules(req, res, models);
	req.body.isText = true;
	await sendSchedules(req, res, models);
}

async function deleteSchedules(req, res, models) {
	let end = moment(req.body.forDate);
	end.add(1, 'd');

	const and = [{
		scheduleDate: { [Op.gte]: moment(req.body.forDate).format("YYYY-MM-DD") }
	},
	{
		scheduleDate: { [Op.lt]: end.format("YYYY-MM-DD") }
	},
	{
		companyId: res.locals.user.companyId,
	}];

	let result = {};
	if (req.body.unscheduled) {
		and.push({
			userId: null
		});
		result = await models.schedule.destroy({
			where: {
				[Op.and]: and
			},
		});
	}
	else {
		and.push({
			userId: { [Op.ne]: null }
		});
		result = await models.schedule.update({
			userId: null
		}, {
				where: {
					[Op.and]: and
				}
			});
	}

	return result;
}

module.exports = {
	getWhere,
	getIncludes,
	format,
	// created,
	// updated,
	schedulesFromTemplate,
	schedulesFromPrevious,
	sendSchedules,
	deleteSchedules,
	publishSchedules,
}