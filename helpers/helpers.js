const moment = require('moment');
const modelhelpers = require('./modelhelpers');
const emailhelper = require('./emailhelper');
const constants = require('../models/constants');
const userhelper = require('./userhelper');
const Op = require('sequelize').Op;
const h2p = require('html2plaintext');

const LOOKUP_SEARCH_TYPES = {
	ENTRIES: 0,
	GENERAL_TASKS: 1,
	MAINTENANCE_REQUEST: 2,
	ATTENDANCE: 3,
	SCHEDULE: 4,
	PROGRESS_CHECKLIST: 5,
}

function newGuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

async function findAll(model, sortField, companyId, args, req, res) {
	if (!args) args = {};
	args.where = Object.assign({
		companyId
	}, args.where);
	const results = await model.findAll(args);
	const mapped = results.map(r => modelhelpers.getFormattedResult(r, model, req, res));
	mapped.sort((a, b) => {
		if (a[sortField] > b[sortField]) return 1;
		if (a[sortField] < b[sortField]) return -1;
		return 0;
	});
	return Promise.resolve(mapped);
}

async function sendStatusChangedComments(commentsEntry, req, res) {
	await emailhelper.sendEmail(commentsEntry.user.email, `${userhelper.getDisplayName(res.locals.user)} has changed one of your statuses!`,
		commentsEntry.comments, res.locals.user.email, true);
}

async function entriesFromSchedule(forDate, req, res) {
	const models = require('../models');
	let dtFrom = moment(forDate);
	let dtTo = moment(forDate);
	dtTo.add(1, 'd');
	const qry = `
		insert into "entry" (entry_date, company_id, shift_id, user_id, task_id, created_at, updated_at, updated_by, entered_by_id)
		select schedule_date, company_id, shift_id, user_id, task_id, now(), now(), '${res.locals.user.email}', '${res.locals.user.userId}'
		from "schedule" where schedule_date >= '${dtFrom.format("MM-DD-YYYY")}' and schedule_date < '${dtTo.format("MM-DD-YYYY")}'
		and deleted_at is null and user_id is not null and company_id='${res.locals.user.companyId}'`;
	return await models.db.query(qry);
}

async function sendInvitation(userId, req, res) {
	const models = require('../models');
	const template = await models.emailTemplate.findOne({
		where: {
			companyId: res.locals.user.companyId,
			templateType: constants.EMAIL_TEMPLATE_TYPE.invitation
		}
	});
	if (!template) {
		throw new Error("Invitation email template has not been configured!");
	}
	const user = await models.user.findById(userId);
	const guid = newGuid();
	await models.user.update({ forgotPassword: guid }, {
		where: {
			userId,
		},
		fields: ['forgotPassword']
	});
	let html = template.body;
	html = html.replace(/\[Link\]/g, `${process.env.WEB_URL}${guid}`);

	await emailhelper.sendEmail([user.email], template.subject,
		html, res.locals.user.email, true, false, true);
}

async function getLookups(companyId, req, res) {
	const models = require('../models');
	const type = req.query.lookupType || 0;
	const shifts = type == LOOKUP_SEARCH_TYPES.ENTRIES || type == LOOKUP_SEARCH_TYPES.SCHEDULE ? await findAll(models.shift, 'shiftName', companyId, null, req, res) : undefined;
	const statuses = type == LOOKUP_SEARCH_TYPES.ENTRIES ? await findAll(models.status, 'statusName', companyId, null, req, res) : undefined;
	const attendanceReasons = type == LOOKUP_SEARCH_TYPES.ATTENDANCE ? await findAll(models.attendanceReason, 'reasonName', companyId, null, req, res) : undefined;
	const tasks = type < LOOKUP_SEARCH_TYPES.MAINTENANCE_REQUEST || type == LOOKUP_SEARCH_TYPES.SCHEDULE ? await findAll(models.task, 'taskName', companyId, {
		include: type == LOOKUP_SEARCH_TYPES.ENTRIES ? [{
			model: models.subtask, as: 'subtasks'
		}] : undefined,
		where: { taskType: type == LOOKUP_SEARCH_TYPES.SCHEDULE ? 0 : type }
	}, req, res) : undefined;

	let userArgs = {
		attributes: ['companyId', 'userId', 'firstName', 'middleName', 'lastName', 'showOnSchedule', 'userName', 'positionId', 'roles'],
		include: [{
			model: models.position,
			as: 'position',
			paranoid: false,
		}],
		where: {
			isFired: false,
		}
	};
	if (type == LOOKUP_SEARCH_TYPES.SCHEDULE) {
		userArgs.include = userArgs.include.concat([{
			model: models.userAvailability,
			as: 'userAvailabilitys',
			attributes: ['userAvailabilityId', 'dayOfWeek', 'startTime', 'endTime', 'status', 'allDay']
		}, {
			model: models.leaveRequest,
			as: 'leaveRequests',
			attributes: ['leaveRequestId', 'startDate', 'endDate', 'status']
			// TODO: check performance - where: { startDate: { [Op.gte]: new Date(req.query.startDate) } }
		}]);
	}
	const users = await findAll(models.user, 'displayName', companyId, userArgs, req, res);
	const payRates = type != LOOKUP_SEARCH_TYPES.SCHEDULE ? await findAll(models.payRate, 'description', companyId, null, req, res) : undefined;
	const progressChecklists = type == LOOKUP_SEARCH_TYPES.PROGRESS_CHECKLIST ? await findAll(models.progressChecklist, 'checklistName', companyId, {
		include: { model: models.progressItem, as: 'progressItems' }
	}, req, res) : undefined;
	const positions = type == LOOKUP_SEARCH_TYPES.ENTRIES || type == LOOKUP_SEARCH_TYPES.SCHEDULE ? await findAll(models.position, 'positionName', companyId, null, req, res) : undefined;
	return {
		shifts,
		statuses,
		tasks,
		users,
		positions,
		payRates,
		attendanceReasons,
		progressChecklists,
	}
}

module.exports = {
	getLookups,
	sendStatusChangedComments,
	sendInvitation,
	entriesFromSchedule,
	newGuid,
}