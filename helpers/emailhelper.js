const confighelper = require('./confighelper');
// const sendgrid = require('@sendgrid/mail');
const moment = require('moment');
const userhelper = require('./userhelper');
const nodemailer = require('nodemailer');
const constants = require('../models/constants');
const Op = require('sequelize').Op;
const h2p = require('html2plaintext');
const localdate = require('../utils/dateutils').localdate;

async function sendEmail(tos, subject, body, replyTo, throwOnError, isText, immediate, parentId) {
	if (!tos || (Array.isArray(tos) && tos.length < 1)) return;
	if (!Array.isArray(tos))
		tos = [tos];

	if (process.env.NODE_ENV == 'development') {
		tos = tos.map(t => {
			return `${t.substring(0, t.indexOf('@'))}@mailinator.com`;
		})
	}
	else if (process.env.NODE_ENV == 'qa') {
		if (isText) {
			tos = ['8053057119@mms.att.net'];
		}
		else {
			tos = ['theteamtracker1@gmail.com'];
		}
	}

	const email = {
		tos,
		subject: isText ? null : subject,
		body,
		isText,
		// replyTo, - PRIVACY!
		parentId,
		emailDate: new Date()
	}

	if (immediate && process.env.NODE_ENV != 'test') {
		await processEmail(email);
	}
	else {
		const models = require('../models');
		await models.emailQueue.create(email);
	}
}

async function processEmail(email) {
	console.log("SENDING TO: " + email.tos.join(','));

	// sendgrid.setApiKey(process.env.SEND_GRID_KEY);
	// const msg = {
	// 	to: [process.env.EMAIL_FROM],
	// 	from: process.env.EMAIL_FROM,
	// 	subject: email.subject || 'NOSUBJECT',
	// 	html: email.body,
	// 	text: h2p(email.body.trim()),
	// 	bcc: email.tos,
	// }

	// if (email.emailQueueAttachments && email.emailQueueAttachments.length) {
	// 	msg.attachments = email.emailQueueAttachments.map(a => {
	// 		return {
	// 			filename: a.attachmentName,
	// 			content: a.attachment.toString('base64'),
	// 			type: a.attachmentType,
	// 			disposition: 'attachment'
	// 		}
	// 	});
	// }

	try {
		// const info = await sendgrid.send(msg);


		let mailOptions = {
			from: process.env.EMAIL_FROM,
			bcc: email.tos,
			subject: email.isText ? null : email.subject,
			html: email.isText ? null : email.body,
			text: email.isText ? email.body.trim() : null,
			replyTo: process.env.EMAIL_FROM,
			// replyTo: email.replyTo,
		};

		if (email.emailQueueAttachments && email.emailQueueAttachments.length) {
			mailOptions.attachments = email.emailQueueAttachments.map(a => {
				return {
					filename: a.attachmentName,
					content: a.attachment,
					contentType: a.attachmentType
				}
			});
		}

		let transporter = nodemailer.createTransport({
			host: process.env.SMTP_SERVER,
			port: process.env.SMTP_PORT,
			secure: parseInt(process.env.SMTP_PORT) == 465,
			auth: process.env.SMTP_USER ? {
				user: process.env.SMTP_USER,
				pass: confighelper.getDecryptedSMTPPassword(process.env.SMTP_PASSWORD)
			} : undefined
		});

		const info = await transporter.sendMail(mailOptions);


		console.log("SENT: ", info.response);
	}
	catch (e) {
		// if (e.response && e.response.body && e.response.body.errors) {
		// 	throw new Error(e.response.body.errors.map(e => e.message).join(','));
		// }
		throw e;
	}
}

async function processEmailQueue() {
	const models = require('../models');
	const emails = await models.emailQueue.findAll({
		orderBy: ['email_date'],
		include: {
			model: models.emailQueueAttachment,
			as: 'emailQueueAttachments',
		}
	});
	for (let e of emails) {
		try {
			await processEmail(e);
			await models.emailQueueAttachment.destroy({
				where: { emailQueueId: e.emailQueueId }
			});
			await models.emailQueue.destroy({
				where: { emailQueueId: e.emailQueueId }
			});
		}
		catch (e) {
			// TODO:
			console.log("E:", e);
		}
	}
}

function getScheduleLine(schedule, company) {
	let schedDate = localdate(schedule.scheduleDate, company);
	let start = new Date(schedule.startTime);
	let end = new Date(schedule.endTime);
	let line = `${schedDate.format("dddd")}, ${schedDate.format("L")}, ${localdate(start, company).format("LT")} - ${localdate(end, company).format("LT")}: ${schedule.shift.shiftName} - ${schedule.task.taskName}`;
	if (schedule.notes) {
		line += ` (${schedule.notes})`;
	}
	return line;
}

async function sendScheduleEmails(schedules, template, isText, res) {
	const usersSchedules = [];
	for (let s of schedules) {
		let us = usersSchedules.find(u => u.user.userId == s.userId);
		if (!us) {
			us = {
				user: s.user,
				schedules: []
			};
			usersSchedules.push(us);
		}
		us.schedules.push(s);
	}

	for (let us of usersSchedules) {
		if (isText && !us.user.enableTextNotifications) continue;
		if (!isText && !us.user.enableEmailNotifications) continue;
		if (us.schedules.length < 1) continue;
		if (isText && (!us.user.phoneNumber || !us.user.cellPhoneCarrier)) continue;
		let schedulesPart = '';
		let minDt = null
		let maxDt = null;
		for (let sched of us.schedules) {
			schedulesPart += getScheduleLine(sched, res.locals.user.company);
			let schedDate = moment(sched.scheduleDate);
			// moment().diff(date_time, 'minutes')
			if (!minDt || schedDate.isBefore(minDt)) {
				minDt = moment(schedDate);
			}
			if (!maxDt || schedDate.isAfter(minDt)) {
				maxDt = moment(schedDate);
			}
			schedulesPart += isText ? `
` : '<br />';
		}

		let minDtFormatted = minDt.format("L");
		let maxDtFormatted = maxDt.format("L");
		let datesString = minDtFormatted;
		if (maxDtFormatted != minDtFormatted) {
			datesString += ` - ${maxDtFormatted}`;
		}
		let body = (isText ? template.bodyText || h2p(template.body) : template.body)
			.replace(/\[Schedules\]/g, schedulesPart)
			.replace(/\[Employee\]/g, `${userhelper.getDisplayName(us.user)}`)
			.replace(/\[ScheduleDates\]/g, datesString)
			;
		let subject = template.subject
			.replace(/\[Employee\]/g, `${userhelper.getDisplayName(us.user)}`)
			.replace(/\[ScheduleDates\]/g, datesString)
			;
		// TODO: reply to?
		let to = us.user.email;
		if (isText && us.user && us.user.phoneNumber && us.user.cellPhoneCarrier)
			to = `${us.user.phoneNumber.replace(/\D/g, '')}@${us.user.cellPhoneCarrier.domain}`

		await sendEmail([to], isText ? null : subject, body, null, true, isText);
	}
}

async function sendNotification(models, forRole, user, subject, body, textBody, extras, parentId) {
	const toNotify = await models.user.findAll({
		include: {
			model: models.cellPhoneCarrier, as: 'cellPhoneCarrier'
		},
		where: {
			roles: { [Op.overlap]: [forRole.value] },
			companyId: user.companyId,
			isFired: false,
		}
	});

	const emailNotify = toNotify.filter(n => n.enableEmailNotifications);
	await sendEmail(emailNotify.map(n => n.email).concat(extras || []),
		subject, body, user.email, true, false, null, parentId);

	const textNotify = toNotify.filter(n => n.enableTextNotifications
		&& n.phoneNumber && n.cellPhoneCarrier);
	if (textNotify.length > 0) {
		await sendEmail(textNotify.map(n => `${n.phoneNumber.replace(/\D/g, '')}@${n.cellPhoneCarrier.domain}`), null,
			(textBody || h2p(body)), user.email, true, true, null, parentId);
	}
}

module.exports = {
	sendEmail,
	sendScheduleEmails,
	sendNotification,
	processEmailQueue,
}