
const moment = require('moment');
const constants = require('../constants');
const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const userFormat = require('./user').format;
const h2p = require('html2plaintext');
const localdate = require('../../utils/dateutils').localdate;
const defaults = require('../../helpers/defaults');

function format(availability, req, res, model) {
	if (availability.user) {
		if (availability.user.get) availability.user = availability.user.get();
		availability.user = userFormat(availability.user, req, res, model);
	}
	if (availability.approvedDeniedBy) {
		if (availability.approvedDeniedBy.get) availability.approvedDeniedBy = availability.approvedDeniedBy.get();
		availability.approvedDeniedBy = userFormat(availability.approvedDeniedBy, req, res, model);
	}
	if (availability.startTime && availability.endTime && new Date(availability.startTime) > new Date(availability.endTime)) {
		availability.endTime = new Date(availability.endTime);
		availability.endTime.setDate(availability.endTime.getDate() + 1);
	}
	return availability;
}

async function creating(availability, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (availability.userId != loggedinUser.userId) {
			throw new Error('_403_Unauthorized!');
		}
		else if (availability.status != 0) {
			availability.status = 0;
			availability.approvedDeniedById = null;
			availability.approvedDeniedDate = null;
		}
	}
}

function replaceRequestTemplate(availability, raw, requestedBy, user) {

	const startTime = new Date(availability.startTime);
	const endTime = new Date(availability.endTime);

	let dayOfWeek = '';
	switch (availability.dayOfWeek) {
		case 0:
			dayOfWeek = "Sunday";
			break;
		case 1:
			dayOfWeek = "Monday";
			break;
		case 2:
			dayOfWeek = "Tuesday";
			break;
		case 3:
			dayOfWeek = "Wednesday";
			break;
		case 4:
			dayOfWeek = "Thursday";
			break;
		case 5:
			dayOfWeek = "Friday";
			break;
		case 6:
			dayOfWeek = "Saturday";
			break;
	}
	return raw
		.replace(/\[StartTime\]/, availability.allDay ? 'All Day' : localdate(startTime, user.company).format('LT'))
		.replace(/\[EndTime\]/, availability.allDay ? '' : localdate(endTime, user.company).format('LT'))
		.replace(/\[DayOfWeek\]/, dayOfWeek)
		.replace(/\[Employee\]/, userhelper.getDisplayName(requestedBy))
		;
}

async function sendRequestEmail(request, user, models, res, isForDelete) {
	const emailTemplate = await defaults.getEmailTemplate(models,
		isForDelete ? constants.EMAIL_TEMPLATE_TYPE.userAvailabilityDeleteRequest : constants.EMAIL_TEMPLATE_TYPE.userAvailability,
		user.companyId, user.userId);
	const requestedBy = await models.user.findById(request.userId);
	await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
		replaceRequestTemplate(request, emailTemplate.subject, requestedBy, res.locals.user),
		replaceRequestTemplate(request, emailTemplate.body, requestedBy, res.locals.user),
		replaceRequestTemplate(request, emailTemplate.bodyText || h2p(emailTemplate.body), requestedBy, res.locals.user)
	)
}

async function created(request, user, models, transaction, req, res, bulk) {
	if (!bulk && !req.query.disableNotifications) {
		if (request.status > 0) {
			return await sendApprovedDeniedEmail(models, request, user);
		}
		await sendRequestEmail(request, user, models, res);
	}
}

function replaceResultTemplate(request, raw, approvedDeniedBy) {
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
	return raw.replace(/\[ApprovedDeniedDate\]/, moment(new Date(request.approvedDeniedDate)).format('L'))
		.replace(/\[Status\]/, status)
		.replace(/\[ApprovedDeniedBy\]/, userhelper.getDisplayName(approvedDeniedBy));
}

async function sendApprovedDeniedEmail(models, request, user, isForDelete) {
	const emailTemplate = await defaults.getEmailTemplate(models,
		isForDelete ? constants.EMAIL_TEMPLATE_TYPE.userAvailabilityDeleteResult : constants.EMAIL_TEMPLATE_TYPE.userAvailabilityResult,
		user.companyId, user.userId);
	const requestedBy = await models.user.findById(request.userId,
		{ include: { model: models.cellPhoneCarrier, as: 'cellPhoneCarrier' } });
	const approvedDeniedBy = await models.user.findById(request.approvedDeniedById);
	if (approvedDeniedBy && requestedBy.userId == approvedDeniedBy.userId) {
		return;
	}

	if (requestedBy.enableEmailNotifications) {
		await emailhelper.sendEmail([requestedBy.email],
			replaceResultTemplate(request, emailTemplate.subject, approvedDeniedBy),
			replaceResultTemplate(request, emailTemplate.body, approvedDeniedBy),
			approvedDeniedBy.email
		);
	}

	if (requestedBy.enableTextNotifications && requestedBy.phoneNumber && requestedBy.cellPhoneCarrier) {
		await emailhelper.sendEmail([`${requestedBy.phoneNumber.replace(/\D/g, '')}@${requestedBy.cellPhoneCarrier.domain}`], null,
			replaceResultTemplate(request, emailTemplate.bodyText || h2p(emailTemplate.body), approvedDeniedBy),
			approvedDeniedBy.email, null, true
		);
	}
}

async function updated(id, request, previous, user, models, transaction, req, res, bulk) {
	if (!bulk && !req.query.disableNotifications && request.userId != user.userId && request.status != previous.status) {
		await sendApprovedDeniedEmail(models, request, user, request.markedForDelete);
	}
	else if (request.status == 0) {
		await sendRequestEmail(request, user, models, res, request.markedForDelete);
	}
}

async function updating(id, prev, request, user, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (prev.userId != user.userId) {
			throw new Error('_403_Unauthorized!');
		}
		else {
			request.status = 0;
			request.approvedDeniedById = null;
			request.approvedDeniedDate = null;
		}
	}
	else if (prev.markedForDelete) {
		request.approvedDeniedById = user.userId;
		request.approvedDeniedDate = new Date();
		request.userId = prev.userId;
		await sendApprovedDeniedEmail(models, request, user, true);
		await models.userAvailability.update({
			approvedDeniedById: request.approvedDeniedById,
			approvedDeniedDate: request.approvedDeniedDate,
			status: request.status == 2 ? 0 : request.status,
			markedForDelete: request.status != 2
		}, {
				where: {
					userAvailabilityId: id
				},
				transaction,
			});
		if (request.status == 1) {
			const updated = await models.userAvailability.destroy({
				where: {
					userAvailabilityId: id
				},
				transaction,
			});
		}
		return {
			statusCode: 200,
		};
	}
}

async function deleting(id, user, models, transaction, req, res) {
	const userAvailability = await models.userAvailability.findById(id, { transaction });
	if (userAvailability && user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (userAvailability.userId == user.userId) {
			userAvailability.status = 0;
			userAvailability.approvedDeniedById = null;
			userAvailability.approvedDeniedDate = null;
			userAvailability.markedForDelete = true;
			await userAvailability.update({
				approvedDeniedById: null,
				approvedDeniedDate: null,
				status: 0,
				markedForDelete: true,
			}, {
					transaction,
				});
			await sendRequestEmail(userAvailability, user, models, res, true);
			return {
				statusCode: 200,
				payload: userAvailability
			};
		}
		throw new Error('_403_Unauthorized!');
	}

	await userAvailability.update({
		approvedDeniedById: user.userId,
		approvedDeniedDate: new Date()
	}, {
			transaction,
		});
}

async function deleted(id, user, models, transaction) {
	const request = await models.userAvailability.findById(id, { paranoid: false, transaction });
	await sendApprovedDeniedEmail(models, request, user, true);
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
	deleted,
	getWhere,
	getIncludes,
}