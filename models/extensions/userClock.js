const constants = require('../constants');
const userFormat = require('./user').format;
const Op = require('sequelize').Op;
const defaults = require('../../helpers/defaults');
const localdate = require('../../utils/dateutils').localdate;
const h2p = require('html2plaintext');
const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const moment = require('moment');

function getLegacyWhere(req, res) {
	let and = [];
	if (req.query.forUser) {
		and.push({ userId: res.locals.user.userId });
	}
	if (!req.query.start || !req.query.end) {
		throw new Error("_400_Start and end required!");
	}
	let end = new Date(req.query.end);
	end.setDate(end.getDate() + 1);
	and = and.concat([{
		clockInDate: { [Op.gte]: new Date(req.query.start) }
	},
	{
		clockInDate: { [Op.lt]: end }
	}]);
	return {
		[Op.and]: and
	}
}

function getWhere(req, res) {
	if (req.query.start || req.query.end) {
		return getLegacyWhere(req, res);
	}

	let where = {};
	if (req.query.forUser) {
		where.userId = res.locals.user.userId;
	}

	return where
}

async function creating(userClock, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (userClock.userId != loggedinUser.userId) {
			throw new Error('_403_Unauthorized!');
		}
		userClock.status = 1;
	}
}

async function updating(id, prev, userClock, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		if (prev.userId != loggedinUser.userId) {
			throw new Error('_403_Unauthorized!');
		}
		const prevIn = moment(prev.clockInDate).format("HHmm");
		const currIn = moment(userClock.clockInDate).format("HHmm");
		const prevOut = prev.clockOutDate ? moment(prev.clockOutDate).format("HHmm") : "0000";
		const currOut = userClock.clockOutDate ? moment(userClock.clockOutDate).format("HHmm") : "0000";
		if (prevIn != currIn || prevOut != currOut)
			userClock.status = 1;
	}
}

async function updated(id, userClock, previous, user, models, transaction, req, res, bulk) {
	await checkClockedIn(userClock, models, transaction);
	if (userClock.status == 1) {
		await sendRequestEmail(userClock, user, models, res);
	}
	else if (previous.status == 1 && userClock.status != 1) {
		await sendResponseEmail(userClock, user, models, res);
	}
}

async function deleting(id, user, models) {
	const userClock = await models.userClock.findById(id);
	if (userClock && user.roles.indexOf(constants.ROLE.SCHEDULING.value) < 0 &&
		user.roles.indexOf(constants.ROLE.ADMIN.value) < 0 &&
		userClock.userId != user.userId) {
		throw new Error('_403_Unauthorized!');
	}
}

async function deleted(id, user, models, transaction) {
	const curr = await models.userClock.findById(id, { paranoid: false });
	await checkClockedIn(curr, models, transaction);
}

function replaceTemplate(userClock, raw, requestedBy, user) {

	const clockInDate = localdate(userClock.clockInDate, requestedBy.company)
	const clockOutDate = localdate(userClock.clockOutDate, requestedBy.company)

	return raw
		.replace(/\[Date\]/, `${clockInDate.format("dddd")}, ${clockInDate.format('L')}`)
		.replace(/\[ClockInTime\]/, clockInDate.format('LT'))
		.replace(/\[ClockOutTime\]/, userClock.clockOutDate ? clockOutDate.format('LT') : '')
		.replace(/\[Employee\]/, userhelper.getDisplayName(requestedBy))
		.replace(/\[Status\]/, userClock.status == 0 ? 'Approved' : 'Denied')
		;
}

async function sendRequestEmail(userClock, user, models, res) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.userClock, user.companyId, user.userId);
	const requestedBy = await models.user.findById(userClock.userId, { include: { model: models.company, as: 'company' } });
	await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
		replaceTemplate(userClock, emailTemplate.subject, requestedBy, res.locals.user),
		replaceTemplate(userClock, emailTemplate.body, requestedBy, res.locals.user),
		replaceTemplate(userClock, emailTemplate.bodyText || h2p(emailTemplate.body), requestedBy, res.locals.user)
	)
}

async function sendResponseEmail(userClock, user, models, res) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.userClockResponse, user.companyId, user.userId);
	const requestedBy = await models.user.findById(userClock.userId, {
		include: [
			{ model: models.company, as: 'company' },
			{ model: models.cellPhoneCarrier, as: 'cellPhoneCarrier' },
		]
	});

	if (requestedBy.enableEmailNotifications) {
		await emailhelper.sendEmail([requestedBy.email],
			replaceTemplate(userClock, emailTemplate.subject, requestedBy, res.locals.user),
			replaceTemplate(userClock, emailTemplate.body, requestedBy, res.locals.user),
			res.locals.user.email, true);
	}

	if (requestedBy.enableTextNotifications && requestedBy.phoneNumber && requestedBy.cellPhoneCarrier) {
		await emailhelper.sendEmail([`${requestedBy.phoneNumber.replace(/\D/g, '')}@${requestedBy.cellPhoneCarrier.domain}`],
			'',
			replaceTemplate(userClock, emailTemplate.bodyText || h2p(emailTemplate.body), requestedBy, res.locals.user),
			res.locals.user.email, true, true);
	}
}

async function created(userClock, user, models, transaction, req, res, bulk) {
	await checkClockedIn(userClock, models, transaction);
	if (userClock.status == 1) {
		await sendRequestEmail(userClock, user, models, res);
	}
}

async function checkClockedIn(userClock, models, transaction) {
	const existing = await models.userClock.findAll({
		where: { userId: userClock.userId, clockOutDate: null },
		transaction
	})
	await models.user.update({
		clockedIn: existing && existing.length ? true : false
	}, {
			where: { userId: userClock.userId },
			transaction
		});
}

function format(userClock, req, res, model) {
	if (userClock.user) {
		if (userClock.user.get) userClock.user = userClock.user.get();
		userClock.user = userFormat(userClock.user, req, res, model);
	}
	return userClock;
}

function getIncludes(models, req, res) {
	let includes = [
		{ model: models.user, as: 'user', paranoid: false, where: { companyId: res.locals.user.companyId } },
	];

	return includes;
}

module.exports = {
	getWhere,
	getIncludes,
	format,
	creating,
	created,
	updating,
	updated,
	deleting,
	deleted,
}