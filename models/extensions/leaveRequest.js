
const constants = require('../constants');
const emailhelper = require('../../helpers/emailhelper');
const userFormat = require('./user').format;
const userhelper = require('../../helpers/userhelper');
const localdate = require('../../utils/dateutils').localdate;
const h2p = require('html2plaintext');
const defaults = require('../../helpers/defaults');

function format(leaveRequest, req, res, model) {
	if (leaveRequest.user) {
		if (leaveRequest.user.get) leaveRequest.user = leaveRequest.user.get();
		leaveRequest.user = userFormat(leaveRequest.user, req, res, model);
	}
	if (leaveRequest.approvedDeniedBy) {
		if (leaveRequest.approvedDeniedBy.get) leaveRequest.approvedDeniedBy = leaveRequest.approvedDeniedBy.get();
		leaveRequest.approvedDeniedBy = userFormat(leaveRequest.approvedDeniedBy, req, res, model);
	}
	leaveRequest.requestedDate = leaveRequest.created_at;
	return leaveRequest;
}

async function creating(leaveRequest, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (leaveRequest.userId != loggedinUser.userId) {
			throw new Error('_403_Unauthorized!');
		}
		else if (leaveRequest.status != 0) {
			leaveRequest.status = 0;
			leaveRequest.approvedDeniedById = null;
			leaveRequest.approvedDeniedDate = null;
		}
	}
}

function replaceRequestTemplate(request, raw, requestedBy, company) {

	const startDt = localdate(new Date(request.startDate), company);
	const endDt = request.endDate ? localdate(new Date(request.endDate), company) : null;

	return raw.replace(/\[StartDate\]/, startDt.format(`L${startDt.hours() == 0 && startDt.minutes() == 0 ? '' : ' LT'}`))
		.replace(/\[EndDate\]/, endDt ?
			endDt.format(`L${endDt.hours() == 0 && endDt.minutes() == 0 ? '' : ' LT'}`) : '')
		.replace(/\[Employee\]/, userhelper.getDisplayName(requestedBy))
		.replace(/\[Reason\]/, request.reason || '')
		;
}

async function sendApprovedDeniedEmail(request, user, models) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.leaveRequestResult, user.companyId, user.userId);
	const requestedBy = await models.user.findById(request.userId,
		{ include: { model: models.cellPhoneCarrier, as: 'cellPhoneCarrier' }, paranoid: false });
	const approvedDeniedBy = await models.user.findById(request.approvedDeniedById);
	if (approvedDeniedBy && requestedBy.userId == approvedDeniedBy.userId) {
		return;
	}
	if (requestedBy.enableEmailNotifications) {
		await emailhelper.sendEmail([requestedBy.email],
			replaceResultTemplate(request, emailTemplate.subject, approvedDeniedBy, user.company),
			replaceResultTemplate(request, emailTemplate.body, approvedDeniedBy, user.company),
			approvedDeniedBy.email
		);
	}

	if (requestedBy.enableTextNotifications && requestedBy.phoneNumber && requestedBy.cellPhoneCarrier) {
		await emailhelper.sendEmail([`${requestedBy.phoneNumber.replace(/\D/g, '')}@${requestedBy.cellPhoneCarrier.domain}`], null,
			replaceResultTemplate(request, emailTemplate.bodyText || h2p(emailTemplate.body), approvedDeniedBy, user.company),
			approvedDeniedBy.email, null, true
		);
	}
}

function replaceResultTemplate(request, raw, approvedDeniedBy, company) {
	let status = request.status;
	switch (request.status) {
		case 0:
			status = 'Pending';
			break;
		case 1:
			status = 'Approved';
			break;
		case 2:
			status = 'Denied';
			break;
	}
	return raw.replace(/\[ApprovedDeniedDate\]/, localdate(new Date(request.approvedDeniedDate), company).format('L'))
		.replace(/\[Status\]/, status)
		.replace(/\[ApprovedDeniedBy\]/, userhelper.getDisplayName(approvedDeniedBy));
}

async function sendRequestEmail(request, user, models) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.leaveRequest, user.companyId, user.userId);
	const requestedBy = await models.user.findById(request.userId);

	await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
		replaceRequestTemplate(request, emailTemplate.subject, requestedBy, user.company),
		replaceRequestTemplate(request, emailTemplate.body, requestedBy, user.company),
		replaceRequestTemplate(request, emailTemplate.bodyText || h2p(emailTemplate.body), requestedBy, user.company));
}

async function created(request, user, models, transaction, req, res) {
	if (request.status > 0) {
		await sendApprovedDeniedEmail(request, user, models);
	}
	else {
		await sendRequestEmail(request, user, models);
	}
}

async function updated(id, request, previous, user, models, transaction) {
	if (request.status != previous.status) {
		if (request.status == 0) {
			await sendRequestEmail(request, user, models);
		}
		else {
			await sendApprovedDeniedEmail(request, user, models);
		}
	}
}

async function updating(id, prev, leaveRequest, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0 &&
		prev.userId != loggedinUser.userId) {
		throw new Error('_403_Unauthorized!');
	}
	else if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		leaveRequest.status = 0;
		leaveRequest.approvedDeniedById = null;
		leaveRequest.approvedDeniedDate = null;
	}
}

async function deleting(id, user, models) {
	const leaveRequest = await models.leaveRequest.findById(id);
	if (leaveRequest && user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		user.roles.indexOf(constants.ROLE.ADMIN.value) < 0 &&
		leaveRequest.userId != user.userId) {
		throw new Error('_403_Unauthorized!');
	}
}

function getWhere(req, res) {
	let where = {};
	if (req.query.forUser) {
		where.userId = res.locals.user.userId;
	}
	else if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
	else {
		where['$user.company_id$'] = res.locals.user.companyId;
	}

	return where
}

function getIncludes(models, req, res) {
	let includes = [
		{ model: models.user, as: 'user', paranoid: false },
		{ model: models.user, as: 'approvedDeniedBy', paranoid: false },
	];

	return includes;
}

module.exports = {
	format,
	creating,
	created,
	updating,
	updated,
	deleting,
	getWhere,
	getIncludes,
}