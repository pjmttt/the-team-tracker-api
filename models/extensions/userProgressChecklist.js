const modelhelpers = require('../../helpers/modelhelpers');
const constants = require('../constants');
const userFormat = require('./user').format;
const Op = require('sequelize').Op;
const moment = require('moment');

function getWhere(req, res) {
	if (req.query.forUser) {
		return { userId: res.locals.user.userId };
	}
	else if (res.locals.user.roles.indexOf(constants.ROLE.MANAGER.value) < 0 &&
			res.locals.user.roles.indexOf(constants.ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}

	return {};
}

function format(upc, req, res, model) {
	if (upc.user) {
		if (upc.user.get) upc.user = upc.user.get();
		upc.user = userFormat(upc.user, req, res, model);
	}
	if (upc.manager) {
		if (upc.manager.get) upc.manager = upc.manager.get();
		upc.manager = userFormat(upc.manager, req, res, model);
	}
	if (upc.userProgressItems) {
		for (let i of upc.userProgressItems) {
			if (i.completedBy) {
				if (i.completedBy.get) i.completedBy = i.completedBy.get();
				i.completedBy = userFormat(i.completedBy, req, res, model);
			}
		}
	}
	return upc;
}

function getIncludes(models, req, res) {
	let includes = [
		{ model: models.user, as: 'user', paranoid: false },
		{ model: models.user, as: 'manager', paranoid: false },
		{ model: models.progressChecklist, as: 'progressChecklist', paranoid: false },
		{ 
			model: models.userProgressItem, 
			as: 'userProgressItems', 
			paranoid: false,
			include: [{
				model: models.progressItem, as: 'progressItem', paranoid: false
			}, {
				model: models.user, as: 'completedBy', paranoid: false
			}]
		 },
	];

	return includes;
}

module.exports = {
	saveChildren: ['userProgressItems'],
	deleteChildren: ['userProgressItems'],
	getWhere,
	getIncludes,
	format,
}