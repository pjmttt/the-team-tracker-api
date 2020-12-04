const emailhelper = require('../../helpers/emailhelper');
const userhelper = require('../../helpers/userhelper');
const constants = require('../constants');
const Op = require('sequelize').Op;
const h2p = require('html2plaintext');

async function creating(contactUs, loggedinUser, models, transaction, req, res) {
	contactUs.userId = loggedinUser.userId;
}

async function created(contactUs, user, models, transaction) {
	await emailhelper.sendEmail(process.env.CONTACT_US_EMAIL, `Message from ${userhelper.getDisplayName(user)} - ${user.company.companyName}`, `
	<html>
	<body>
	Message submitted by ${userhelper.getDisplayName(user)} - ${user.company.companyName}:
	<br /><br />
	<p>${contactUs.message}</p>
	</body>
	</html>
		`, user.email, true, false, true);

	await emailhelper.sendEmail(process.env.CONTACT_US_PHONE, null, `
	Message submitted by ${userhelper.getDisplayName(user)} - ${user.company.companyName}:
	${h2p(contactUs.message)}
		`, user.email, true, true, true);
}

async function updating(id, prev, leaveRequest, loggedinUser, models, transaction, req, res) {
	throw new Error('_404_Cant update!');
}

async function deleting(id, user, models) {
	if (user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
}

function getWhere(req, res) {
	if (user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
	return {};
}

module.exports = {
	creating,
	created,
	updating,
	deleting,
	getWhere,
	includes: ['user']
}