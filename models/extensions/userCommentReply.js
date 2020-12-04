const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const Op = require('sequelize').Op;
const h2p = require('html2plaintext');

async function creating(reply, loggedinUser, models, transaction, req, res) {
	reply.userId = loggedinUser.userId;
}

async function created(reply, user, models, transaction) {
	const userComment = await models.userComment.findById(reply.userCommentId, {
		transaction,
		// include: {
		// 	model: models.user,
		// 	as: 'user',
		// 	include: {
		// 		model: models.cellPhoneCarrier,
		// 		as: 'cellPhoneCarrier'
		// 	}
		// }
	});
	const subject = `RE: ${userComment.subject}`;
	const emailContent = `${reply.replyText}<br /><br /><br />Sent by ${userhelper.getDisplayName(user)}
	<br /><br /><br />Original message:<br />${userComment.comment}
`;
	const textContent = `${reply.replyText}
	
Sent by ${userhelper.getDisplayName(user)}

Original message:
${userComment.comment}`;

	const text = userComment.sendText;
	const email = userComment.sendEmail;

	const where = { companyId: user.companyId, isFired: false };
	if (userComment.userIds && userComment.userIds.length > 0) {
		const userIds = userComment.userIds.filter(i => i != user.userId);
		if (userComment.userId != user.userId && !userIds.includes(userComment.userId)) {
			userIds.push(userComment.userId);
		}
		where.userId = { [Op.in]: userIds };
	}
	else {
		where.userId = { [Op.ne]: user.userId };
	}

	const users = await models.user.findAll({
		where,
		include: { model: models.cellPhoneCarrier, as: 'cellPhoneCarrier' }
	});



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


	// await emailhelper.sendEmail([userComment.user.email], subject, emailContent, user.email, true, false, true);
	// if (userComment.user.phoneNumber && userComment.user.cellPhoneCarrier) {
	// 	await emailhelper.sendEmail([`${userComment.user.phoneNumber.replace(/\D/g, '')}@${userComment.user.cellPhoneCarrier.domain}`], subject, textContent, user.email, true, true, true);
	// }
}

async function doEmail(emails, subject, content, user, isText) {
	await emailhelper.sendEmail(emails, subject, isText ? h2p(content) : content, user.email,
		true, isText, true);
}

module.exports = {
	creating,
	created,
	includes: ['user']
}