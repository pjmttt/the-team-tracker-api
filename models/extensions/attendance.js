const ROLE = require('../constants').ROLE;
const userFormat = require('./user').format;
const Op = require('sequelize').Op;

function format(attendance, req, res, model) {
	if (attendance.user) {
		attendance.user = userFormat(attendance.user, req, res, model);
	}
	return attendance;
}

// not to break mobile, obsolete
function getLegacyWhere(req, res) {
	if (!req.query.start || !req.query.end) {
		throw new Error("_400_Start and end required!");
	}
	let end = new Date(req.query.end);
	end.setDate(end.getDate() + 1);
	end.setSeconds(end.getSeconds() - 1);
	const and = [{
		attendanceDate: { [Op.gte]: new Date(req.query.start) }
	},
	{
		attendanceDate: { [Op.lt]: end }
	}];
	if (req.query.forUser) {
		and.push({ userId: res.locals.user.userId });
	}
	else if (res.locals.user.roles.indexOf(ROLE.MANAGER.value) < 0 && res.locals.user.roles.indexOf(ROLE.SCHEDULING.value) < 0
		&& res.locals.user.roles.indexOf(ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}
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
	else if (res.locals.user.roles.indexOf(ROLE.MANAGER.value) < 0 && res.locals.user.roles.indexOf(ROLE.SCHEDULING.value) < 0
		&& res.locals.user.roles.indexOf(ROLE.ADMIN.value) < 0) {
		throw new Error('_403_Unauthorized!');
	}

	return where;
}

module.exports = {
	includes: ['attendanceReason', 'user'],
	getWhere,
	format
}