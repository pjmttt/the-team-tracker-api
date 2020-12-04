const emailhelper = require('../../helpers/emailhelper');
const constants = require('../constants');
const sequelize = require('sequelize');

async function creating(demoRequest, loggedinUser, models, transaction, req, res) {
	const users = await models.user.findAll({
		where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', demoRequest.email)),
	});
	if (users && users.length > 0) {
		throw new Error('_409_A user with this email address already exists!');
	}
}

async function created(demoRequest, user, models, transaction) {
	await emailhelper.sendEmail(process.env.CONTACT_US_EMAIL, `Demo Request by ${demoRequest.firstName} ${demoRequest.lastName}`, `
	<html>
	<body>
	Demo requested by ${demoRequest.firstName} ${demoRequest.lastName}:
	<br />
	Company: ${demoRequest.companyName}<br />
	Email: ${demoRequest.email}<br />
	Phone: ${demoRequest.phoneNumber || ''}<br />
	</body>
	</html>
		`, demoRequest.email, true, false, true);

	await emailhelper.sendEmail(process.env.CONTACT_US_PHONE, null, `
	Demo requested by ${demoRequest.firstName} ${demoRequest.lastName}
	Company: ${demoRequest.companyName}
	Email: ${demoRequest.email}
	Phone: ${demoRequest.phoneNumber || ''}
		`, demoRequest.email, true, true, true);
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
}