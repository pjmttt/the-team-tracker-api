const JWT_KEY = "!!TE4M_TRACK3R!!";
const jwt = require('jsonwebtoken');
const models = require('../models');
const encrypter = require('../helpers/encrypter');
const emailhelper = require('../helpers/emailhelper');
const modelhelpers = require('../helpers/modelhelpers');
const userhelper = require('../helpers/userhelper');
const defaults = require('../helpers/defaults');
const localdate = require('../utils/dateutils').localdate;
const sequelize = require('sequelize');
const Op = sequelize.Op;
const moment = require('moment');
const constants = require('../models/constants');
const location = require('./location');

const userInclude = [{
	model: models.company, as: 'company'
}, {
	model: models.position, as: 'position', paranoid: false
}];

async function getLoggedInUser(req) {
	if (process.env.NODE_ENV == 'test' && !req.headers['Access-Token'] && !req.headers['access-token']) {
		return await models.user.findOne({
			include: userInclude,
			where: {
				email: 'zero@mailinator.com'
			},
		});
	}

	const header = req.headers['Access-Token'] || req.headers['access-token'];
	if (!header) {
		throw new Error('Missing access token!');
	}

	const token = jwt.verify(header, JWT_KEY);
	if (!token.email)
		throw new Error('Invalid token!');

	const users = await models.user.findAll({
		include: userInclude,
		where:
			sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', token.email))
	});

	if (!users || users.length < 1) throw new Error('Invalid user!');
	const user = users[0];

	if (user.isFired) {
		throw new Error('Access Denied!');
	}

	// TODO: switch mobile app to use rememberMe
	if (!token.mobile && !token.rememberMe) {
		const minExpDate = new Date();
		minExpDate.setSeconds(minExpDate.getSeconds() - process.env.TOKEN_EXPIRATION);
		if (user.lastActivity < minExpDate)
			throw new Error("Token expired!");
	}
	await models.user.update({
		lastActivity: new Date()
	}, {
			where: { userId: user.userId },
			fields: ['lastActivity']
		});
	return user;
}

// TODO replace mobile with rememberMe
async function validateUser(email, password, mobile, rememberMe, req, res) {
	const pwencrypted = encrypter.encrypt(constants.ENCRYPT_KEY, password);
	const users = await models.user.findAll({
		where: {
			[Op.and]: [
				sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email)),
				{ password: pwencrypted }
			]
		},
		include: userInclude
	});
	if (!users || users.length < 1)
		throw '_401_Email or Password invalid!';
	const user = users[0];

	if (user.isFired) {
		throw new Error('Access Denied!');
	}

	await models.user.update({
		lastActivity: new Date()
	}, {
			where: { userId: user.userId },
			fields: ['lastActivity']
		});
	const formattedUser = modelhelpers.getFormattedResult(user, models.user, req, res);

	if (formattedUser.roles.indexOf(constants.ROLE.ADMIN.value) >= 0) {
		formattedUser.roles.push(constants.ROLE.MANAGER.value);
		formattedUser.roles.push(constants.ROLE.MAINTENANCE_REQUESTS.value);
		formattedUser.roles.push(constants.ROLE.INVENTORY.value);
		formattedUser.roles.push(constants.ROLE.SCHEDULING.value);
	}
	if (formattedUser.roles.indexOf(constants.ROLE.MANAGER.value) >= 0) {
		formattedUser.roles = formattedUser.roles.concat([160, 300, 1700]);
	}
	if (formattedUser.roles.indexOf(constants.ROLE.SCHEDULING.value) >= 0) {
		formattedUser.roles = formattedUser.roles.concat([1100, 1300, 1460]);
	}

	const accessToken = jwt.sign({ email, mobile, rememberMe }, JWT_KEY);
	return Promise.resolve({ accessToken, user: formattedUser });
}



function getScheduleText(schedule, isForText, company) {
	if (!schedule) return '';
	const locdate = localdate(schedule.scheduleDate, company);
	return `${locdate.format("dddd")}, ${locdate.format("L")}: ${localdate(schedule.startTime, company).format("LT")} - ${localdate(schedule.endTime, company).format("LT")}${isForText ? `
	`: '<br />'}${schedule.shift.shiftName} - ${schedule.task.taskName}`;
}

function replaceLateTemplate(clockInDate, raw, schedule, user, isForText) {
	const locInDt = localdate(clockInDate, user.company)
	return raw
		.replace(/\[Date\]/, locInDt.format('L'))
		.replace(/\[ClockInTime\]/, locInDt.format('LT'))
		.replace(/\[Employee\]/, userhelper.getDisplayName(user))
		.replace(/\[Schedule\]/, getScheduleText(schedule, isForText, user.company))
		;
}

function intTime(time) {
	return moment(time).format("HHmm");
}

async function checkIfLate(user, clockInDate) {
	if (user.company.minutesBeforeLate) {
		const previousClocks = await models.userClock.findAll({
			where: {
				clockInDate: { $gt: moment(clockInDate).format("MM-DD-YYYY") },
				clockOutDate: { $ne: null }
			}
		});
		if (previousClocks.length <= 0) {
			const adjustStart = moment(clockInDate).add(-1 * user.company.minutesBeforeLate, 'm').toDate();
			const currSchedule = await models.schedule.findAll({
				where: {
					userId: user.userId,
					scheduleDate: moment().format("MM-DD-YYYY"),
				},
				include: [
					{ model: models.task, as: 'task' },
					{ model: models.shift, as: 'shift' },
				]
			});
			const lateSched = currSchedule.find(s => intTime(s.startTime) < intTime(adjustStart));
			if (lateSched) {
				const emailTemplate = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.late, user.companyId, user.userId);
				await emailhelper.sendNotification(models, constants.ROLE.SCHEDULING, user,
					replaceLateTemplate(clockInDate, emailTemplate.subject, lateSched, user),
					replaceLateTemplate(clockInDate, emailTemplate.body, lateSched, user),
					replaceLateTemplate(clockInDate, emailTemplate.bodyText || h2p(emailTemplate.body), lateSched, user, true)
				)
			}
		}
	}
}

async function clockInOut(clockedIn, email, password, req, res) {
	const pwencrypted = encrypter.encrypt(constants.ENCRYPT_KEY, password);
	const users = await models.user.findAll({
		where: {
			[Op.and]: [
				sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email)),
				{ password: pwencrypted }
			]
		},
		include: userInclude
	});
	if (!users || users.length < 1)
		throw '_403_Email or Password invalid!';
	const user = users[0];

	if (user.isFired) {
		throw new Error('Access Denied!');
	}

	if (user.company.ipAddress) {
		const ipParts = location.getIpAddress(req).split(',').map(i => i.trim());
		const coIPParts = user.company.ipAddress.split(',').map(i => i.trim());
		if (!ipParts.some(i => coIPParts.includes(i))) {
			throw new Error(`_409_Sorry, you can not clock in/out from this location!`);
		}
	}
	const displayName = userhelper.getDisplayName(user);
	if (user.clockedIn == clockedIn) {
		throw `_409_${displayName}, is already clocked ${clockedIn ? 'in' : 'out'}, did you forget to clock ${clockedIn ? 'out' : 'in'}?`;
	}
	await models.user.update({
		lastActivity: new Date(),
		clockedIn,
	}, {
			where: { userId: user.userId },
			fields: ['lastActivity', 'clockedIn']
		});
	if (!clockedIn) {
		await models.userClock.update({
			clockOutDate: new Date()
		}, {
				where: { userId: user.userId, clockOutDate: null },
				fields: ['clockOutDate']
			});
	}
	else {
		const clockInDate = new Date();
		await models.userClock.create({
			userId: user.userId,
			clockInDate
		});
		await checkIfLate(user, clockInDate);
	}
	return Promise.resolve({ message: `${displayName}, has been clocked ${clockedIn ? 'in' : 'out'}.` });
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
	var R = 6371000; // m
	var dLat = toRad(lat2 - lat1);
	var dLon = toRad(lon2 - lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
	return Value * Math.PI / 180;
}

async function clockInOutById(userId, req, res) {
	if (res.locals.user.userId != userId) {
		throw new Error('_409_You do not have permission to clock anyone else in/out.');
	}
	const user = await models.user.findById(userId, {
		include: userInclude
	});

	if (user.isFired) {
		throw new Error('_403_Access Denied!');
	}
	if (!user.company.ipAddress && !user.company.geoLocation) {
		throw `_409_Clock in/out is disabled due to missing company info!`;
	}

	let geoMatch = false;
	if (req.body.geoLocation && user.company.geoLocation && user.company.minClockDistance) {
		const companyGeo = user.company.geoLocation.split(',');
		if (companyGeo.length == 2) {
			const dist = calcCrow(companyGeo[0], companyGeo[1],
				req.body.geoLocation.latitude, req.body.geoLocation.longitude);
			if (dist < user.company.minClockDistance / 3) {
				geoMatch = true;
			}
		}
	}

	let ipMatch = false;
	if (!geoMatch && user.company.ipAddress) {
		const ipParts = location.getIpAddress(req).split(',').map(i => i.trim());
		const coIPParts = user.company.ipAddress.split(',').map(i => i.trim());
		if (ipParts.some(i => coIPParts.includes(i))) {
			ipMatch = true;
		}
	}

	if (!ipMatch && !geoMatch) {
		throw `_409_Sorry, you can not clock in/out from this location!` +
		(user.company.geoLocation && !req.body.geoLocation ? ` If clocking in from your mobile device, ensure location services are turned on.` : '');
	}

	const displayName = userhelper.getDisplayName(user);
	const clockedIn = req.body.clockIn === null || req.body.clockIn === undefined ? !user.clockedIn : req.body.clockIn;
	if (user.clockedIn == clockedIn) {
		throw `_409_${displayName}, is already clocked ${clockedIn ? 'in' : 'out'}, did you forget to clock ${clockedIn ? 'out' : 'in'}?`;
	}
	await models.user.update({
		lastActivity: new Date(),
		clockedIn,
	}, {
			where: { userId },
			fields: ['lastActivity', 'clockedIn']
		});
	if (!clockedIn) {
		await models.userClock.update({
			clockOutDate: new Date()
		}, {
				where: { userId, clockOutDate: null },
				fields: ['clockOutDate']
			});
	}
	else {
		const clockInDate = new Date();
		await models.userClock.create({
			userId,
			clockInDate
		});
		await checkIfLate(user, clockInDate);
	}
	return Promise.resolve({ message: `${displayName}, has been clocked ${clockedIn ? 'in' : 'out'}.` });
}

function newGuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

async function processForgotPassword(user) {
	const guid = newGuid();
	await models.user.update({ forgotPassword: guid, lastActivity: new Date() }, {
		where: {
			userId: user.userId,
		},
		fields: ['forgotPassword', 'lastActivity']
	});
	const template = await defaults.getEmailTemplate(models, constants.EMAIL_TEMPLATE_TYPE.forgotPassword, user.companyId, user.userId);

	let html = template.body;
	html = html.replace(/\[Link\]/g, `${process.env.WEB_URL}${guid}`);

	await emailhelper.sendEmail([user.email], template.subject, html, null, true, false, true);
}

async function forgotPassword(email) {
	const users = await models.user.findAll({
		where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', email)),
	});
	if (!users || users.length < 1) {
		throw new Error('Email could not be found!');
	}
	if (users[0].isFired) {
		throw new Error('Access Denied!');
	}

	await processForgotPassword(users[0]);
	return Promise.resolve();
}

async function signup(user, company, password, req, res) {
	const users = await models.user.findAll({
		where: sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', user.email)),
	});
	if (users && users.length > 0) {
		throw new Error('A user with this email address already exists!');
	}
	const transaction = await models.db.transaction();
	try {
		await location.tryUpdateGeo(company, req);
		models.company.deleteSubscriptionInfo(company);
		company.expirationDate = moment().add(30, 'days').toDate();
		const createdCompany = await models.company.create(company, { transaction });
		user.companyId = createdCompany.companyId;
		user.lastActivity = new Date();
		user.password = encrypter.encrypt(constants.ENCRYPT_KEY, password);
		if (!user.userName) {
			user.userName = user.email;
		}

		user.roles = [constants.ROLE.ADMIN.value];

		const createdUser = await models.user.create(user, { transaction });
		const defs = await defaults.populateDefaults(models, createdUser.userId, createdCompany, transaction);
		await models.user.update({
			positionId: defs.positions.find(p => p.positionName == 'General Manager').positionId
		}, {
			where: { userId: createdUser.userId },
			fields: ['positionId'],
			transaction
		});
		await transaction.commit();
	}
	catch (e) {
		await transaction.rollback();
		throw e;
	}

	return await validateUser(user.email, password, undefined, undefined, req, res);
}

async function resetPassword(key, password) {
	const users = await models.user.findAll({
		where: {
			forgotPassword: key,
		},
		include: userInclude
	});
	if (!users || users.length < 1) {
		throw new Error('Token is invalid!');
	}
	const user = users[0];
	// 10 minutes
	if (user.lastActivity && (new Date() - new Date(user.lastActivity)) > (10 * 60 * 1000)) {
		throw new Error('Token has expired!');
	}

	await models.user.update({
		forgotPassword: null,
		lastActivity: new Date(),
		password: encrypter.encrypt(constants.ENCRYPT_KEY, password)
	}, {
			where: {
				userId: user.userId,
			},
			fields: ['forgotPassword', 'lastActivity', 'password']
		});
	return Promise.resolve({ accessToken: jwt.sign({ email: user.email }, JWT_KEY), user });
}

async function ping(req) {
	const header = req.headers['Access-Token'] || req.headers['access-token'];

	if (!header) {
		return moment("1900-01-01");
	}

	const token = jwt.verify(header, JWT_KEY);
	if (!token.email)
		return moment("1900-01-01");

	const users = await models.user.findAll({
		where:
			sequelize.where(sequelize.fn('lower', sequelize.col('email')), sequelize.fn('lower', token.email))
	});

	if (!users || users.length < 1)
		return moment("1900-01-01");

	const user = users[0];

	if (token.rememberMe) {
		return Promise.resolve({
			runningScore: user.runningScore || 0
		});
	}

	let expires = new Date(users[0].lastActivity);

	if (req.query.reset) {
		expires = new Date();
		await models.user.update({
			lastActivity: expires
		}, {
				where: { userId: user.userId },
				fields: ['lastActivity']
			});
	}

	expires.setSeconds(expires.getSeconds() + parseInt(process.env.TOKEN_EXPIRATION));
	return Promise.resolve({
		expires,
		runningScore: user.runningScore || 0
	});
}

module.exports = {
	getLoggedInUser,
	validateUser,
	forgotPassword,
	resetPassword,
	signup,
	ping,
	clockInOut,
	clockInOutById,
}