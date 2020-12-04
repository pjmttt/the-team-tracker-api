const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const userFormat = require('./user').format;
const constants = require('../constants');
const Op = require('sequelize').Op;
const h2p = require('html2plaintext');

async function creating(userComment, loggedinUser, models, transaction, req, res) {
	userComment.userId = loggedinUser.userId;
}

async function created(userComment, user, models, transaction) {

	const content = userComment.comment;
	const subject = userComment.subject;
	const text = userComment.sendText;
	const email = userComment.sendEmail;

	const where = { companyId: user.companyId, isFired: false };
	if (userComment.userIds && userComment.userIds.length > 0) {
		where.userId = { [Op.in]: userComment.userIds };
	}
	else {
		where.userId = { [Op.ne]: user.userId };
	}

	const users = await models.user.findAll({
		where,
		include: { model: models.cellPhoneCarrier, as: 'cellPhoneCarrier' }
	});

	let emailContent = `${content}<br /><br /><br />Sent by ${userhelper.getDisplayName(user)}`;
	let textContent = `${content}
	
Sent by ${userhelper.getDisplayName(user)}`;

	let i = 0;
	let emails = [];
	let numbers = [];
	while (i < users.length) {
		const user = users[i];
		if (email) {
			emails.push(user.email);
		}
		if (text && user.phoneNumber && user.cellPhoneCarrier) {
			numbers.push(`${user.phoneNumber.replace(/\D/g, '')}@${user.cellPhoneCarrier.domain}`);
		}
		if (emails.length >= 50) {
			await doEmail(emails, subject, emailContent, user);
			emails = [];
		}
		if (numbers.length >= 50) {
			await doEmail(numbers, subject, textContent, user, true);
			numbers = [];
		}
		i++;
	}

	if (emails.length > 0) {
		await doEmail(emails, subject, emailContent, user);
	}

	if (numbers.length > 0) {
		await doEmail(numbers, subject, textContent, user, true);
	}
}

async function doEmail(emails, subject, content, user, isText) {
	await emailhelper.sendEmail(emails, subject, isText ? h2p(content) : content, user.email,
		true, isText, true);
}

async function updating(id, prev, leaveRequest, loggedinUser, models, transaction, req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
}

async function deleting(id, user, models) {
	if (user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
}

function getWhere(req, res) {
	if (res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		return {
			$or: [
				{ companyId: res.locals.user.companyId, userIds: null },
				{ userIds: { [Op.contains]: [res.locals.user.userId] } },
				{ userId: res.locals.user.userId }
			]
		}
	}
	return { companyId: res.locals.user.companyId }
}

function getIncludes(models, req, res) {
	let includes = [
		{
			model: models.userCommentReply,
			as: 'userCommentReplys',
			separate: true,
			include: { model: models.user, as: 'user', paranoid: false },
		},
		{ model: models.user, as: 'user', paranoid: false },
	];

	return includes;
}

function format(userComment, req, res, model) {
	if (userComment.user) {
		if (userComment.user.get) userComment.user = userComment.user.get();
		userComment.user = userFormat(userComment.user, req, res, model);
	}
	if (userComment.userCommentReplys) {
		for (let ucr of userComment.userCommentReplys) {
			if (ucr.user) {
				if (ucr.user.get) ucr.user = ucr.user.get();
				ucr.user = userFormat(ucr.user, req, res, model);
			}
		}
	}
	return userComment;
}

module.exports = {
	creating,
	created,
	updating,
	deleting,
	getWhere,
	getIncludes,
	format,
	deleteChildren: ['userCommentReplys'],
}