const emailhelper = require('../../helpers/emailhelper');
const constants = require('../constants');
const userhelper = require('../../helpers/userhelper');
const h2p = require('html2plaintext');
const defaults = require('../../helpers/defaults');
// const fs = require('fs');

function getWhere(req, res) {
	if (req.query.unaddressed) {
		return { isAddressed: false }
	}
	return {};
}

async function created(request, user, models, transaction, req, res) {
	const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.maintenanceRequest, user.companyId, user.userId);

	await emailhelper.sendNotification(models, constants.ROLE.MAINTENANCE_REQUESTS, user,
		emailTemplate.subject,
		emailTemplate.body.replace(/\[MaintenanceRequest\]/, request.requestDescription),
		(emailTemplate.bodyText || h2p(emailTemplate.body)).replace(/\[MaintenanceRequest\]/, request.requestDescription),
		null, request.maintenanceRequestId
	);
}

function getIncludes(models, req, res) {
	let includes = [
		{
			model: models.maintenanceRequestReply,
			as: 'maintenanceRequestReplys',
			separate: true
		},
		{ model: models.user, as: 'assignedTo', paranoid: false },
		{ model: models.user, as: 'requestedBy', paranoid: false },
		{
			model: models.maintenanceRequestImage,
			as: 'maintenanceRequestImages',
			attributes: ['maintenanceRequestImageId', 'imageType', 'maintenanceRequestId'],
			separate: true
		},
	];

	return includes;
}

async function deleting(id, user, models) {
	try {
		// if (fs.existsSync(`maintenanceRequestImages/${user.companyId}/${id}`)) {
		// 	const files = fs.readdirSync(`maintenanceRequestImages/${user.companyId}/${id}`);
		// 	for (let f of files) {
		// 		fs.unlinkSync(`maintenanceRequestImages/${user.companyId}/${id}/${f}`);
		// 	}
		// 	fs.rmdirSync(`maintenanceRequestImages/${user.companyId}/${id}`);
		// }
	}
	catch (e) {
		// TODO:
		console.log("E:", e);
	}
}

module.exports = {
	deleting,
	getWhere,
	created,
	deleteChildren: ['maintenanceRequestReplys', 'maintenanceRequestImages'],
	getIncludes,
}