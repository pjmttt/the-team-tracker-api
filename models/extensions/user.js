const constants = require('../constants');
const sequelize = require('sequelize');
const modelhelpers = require('../../helpers/modelhelpers');
const userhelper = require('../../helpers/userhelper');
const encrypter = require('../../helpers/encrypter');

function validatePayInfo(user, res) {
	if (res.locals.user) {
		if (res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
			delete user.payRateId;
			delete user.payRate;
			delete user.lastRaiseDate;
			delete user.wage;
		}
		if (res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
			delete user.hireDate;
			delete user.lastReviewDate;
			delete user.notes;
		}
	}
}

async function creating(user, loggedinUser, models, transaction, req, res) {
	const co = await models.company.findById(res.locals.user.companyId, {
		include: {
			model: models.user,
			as: 'users',
			where: { isFired: false }
		}
	});

	const curr = await models.user.findOne({ where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', user.email)) });
	if (curr) {
		throw new Error('_400_A user with this email address already exists!');
	}
	if (!user.userName) user.userName = user.email;
	user.password = '!!!NOTSET!!!';
	validatePayInfo(user, res);
}

async function updating(id, prev, user, loggedinUser, models, transaction, req, res) {
	validatePayInfo(user, res);
}

function deleting(id, loggedInUser) {
	if (id == loggedInUser.userId) throw 'Cannot delete logged in user!';
}

function format(user, req, res, model) {
	delete user.password;
	delete user.forgotPassword;
	user.displayName = userhelper.getDisplayName(user);
	validatePayInfo(user, res);
	if (user.userAvailabilitys) {
		const target = model.associations['userAvailabilitys'].target;
		user.userAvailabilitys = user.userAvailabilitys.map(a => modelhelpers.getFormattedResult(a, target, req, res));
	}
	return user;
}

async function updateUserSettings(user, userId, models) {
	const fields = ['firstName', 'middleName', 'lastName', 'phoneNumber', 'cellPhoneCarrierId', 'email', 'enableEmailNotifications', 'enableTextNotifications'];
	if (user.password) {
		user.password = encrypter.encrypt(constants.ENCRYPT_KEY, user.password);
		fields.push('password');
	}
	const result = await models.user.update(user, {
		fields,
		where: { userId },
		returning: true,
	});
	const updatedUser = result[1][0].get();
	delete updatedUser.password;
	return updatedUser;
}

module.exports = {
	creating,
	deleting,
	format,
	getIncludes: function (models) {
		return [
			{ model: models.position, as: 'position', paranoid: false },
			{ model: models.payRate, as: 'payRate', paranoid: false }
		]
	},
	updating,
	updateUserSettings,
}