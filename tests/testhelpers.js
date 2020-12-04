const expect = require('chai').expect;
const request = require('supertest');
const app = require('../server');
const constants = require('../models/constants');
const JWT_KEY = "!!TE4M_TRACK3R!!";
const jwt = require('jsonwebtoken');
const guid = require('../utils/guid');
const moment = require('moment');
moment.suppressDeprecationWarnings = true;

const entriesUrl = '/api/entries';
const generalentriesUrl = '/api/generalentries';
const shiftsUrl = '/api/shifts';
const tasksUrl = '/api/tasks';
const statusesUrl = '/api/statuses';
const positionsUrl = '/api/positions';
const attendanceReasonsUrl = '/api/attendanceReasons';
const lookupsUrl = '/api/lookups';
const usersUrl = '/api/users';
const scheduleUrl = '/api/schedules';
const leaveRequestsUrl = '/api/leaveRequests';
const userAvailabilityUrl = '/api/userAvailability';
const signupUrl = '/api/signup';
const inventoryCategoryUrl = '/api/inventoryCategories';
const vendorUrl = '/api/vendors';
const cellphoneCarrierUrl = '/api/cellPhoneCarriers';
const maintenanceRequestUrl = '/api/maintenanceRequests';

async function signup(initial) {
	const res = await request(app).post(signupUrl).send({
		user: {
			email: initial ? 'zero@mailinator.com' : `e${guid().substring(0, 25)}@mailinator.com`,
			firstName: `f${guid()}`.substring(0, 25),
			lastName: `l${guid()}`.substring(0, 25),
		},
		company: {
			companyName: `test company${guid().substring(0, 10)}`,
			streetAddress1: '435 S. Ocean Ave',
			city: 'Cayucos',
			stateProvince: 'CA',
			postalCode: '93430',
			geoLocation: '35.4456096,-120.8974328',
			minClockDistance: 100,
			minutesBeforeLate: 7,
			subscriptionRequestNumber: guid(),
			subscriptionTransactionNumber: 'shouldbenull',
			modules: [0,1,2,3],
			expirationDate: '2020-01-01',
		},
		password: '12345'
	});
	expect(res.statusCode).to.eq(200);
	expect(res.body.user.company.modules.length).to.eq(4);
	expect(res.body.user.company.subscriptionRequestNumber).to.not.exist;
	expect(res.body.user.company.subscriptionTransactionNumber).to.not.exist;
	expect(moment(res.body.user.company.expirationDate).format("MMDDYYYY")).to.eq(moment().add(30, 'days').format("MMDDYYYY"));
	const models = require('../models');
	const position = await models.position.findOne({ where: { positionName: 'General Manager', companyId: res.body.user.companyId } });
	expect(res.body.user.positionId).to.eq(position.positionId);

	await models.user.update({
		emailNotifications: [],
		enableEmailNotifications: false,
		textNotifications: [],
		enableTextNotifications: false,
	}, {
			fields: ['emailNotifications', 'textNotifications', 'enableEmailNotifications', 'enableTextNotifications'],
			where: { companyId: res.body.user.companyId }
		});

	return res.body;
}

async function createShifts(num) {
	if (!num) num = 5;
	const shifts = [];
	for (let i = 0; i < num; i++) {
		let res = await request(app).post(shiftsUrl).send({
			shiftName: `Test shift ${i}`,
			lunchDuration: 1,
			startTime: moment("1900-01-01 8:00 AM").toDate(),
			endTime: moment("1900-01-01 5:00 PM").toDate(),
		});
		expect(res.statusCode).to.eq(201);
		shifts.push(res.body);
	}
	return shifts;
}

async function createTasks(taskType, num) {
	if (!num) num = 5;
	const tasks = [];
	for (let i = 0; i < num; i++) {
		let res = await request(app).post(tasksUrl).send({
			taskName: `Test task ${i} type ${taskType || 0}`,
			taskType: taskType || 0,
			subtasks: [{
				subtaskName: 'Test subtask 1'
			}, {
				subtaskName: 'Test subtask 2'
			}, {
				subtaskName: 'Test subtask 3'
			}, {
				subtaskName: 'Test subtask 4'
			}, {
				subtaskName: 'Test subtask 5'
			}]
		});
		expect(res.statusCode).to.eq(201);
		tasks.push(res.body);
	}
	return tasks;
}

async function createStatus() {
	let res = await request(app).post(statusesUrl).send({
		statusName: 'Test status',
		abbreviation: 'T',
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createProgressChecklist() {
	let res = await request(app).post('/api/progressChecklists').send({
		checklistName: 'Test checklist'
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createInventoryCategory() {
	let res = await request(app).post(inventoryCategoryUrl).send({
		categoryName: 'test inventory category'
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createVendor() {
	let res = await request(app).post(vendorUrl).send({
		vendorName: 'test vendor'
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createInventoryItem() {
	const cat = await createInventoryCategory();
	let res = await request(app).post('/api/inventoryItems').send({
		inventoryItemName: 'test inv',
		inventoryCategoryId: cat.inventoryCategoryId
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createCellPhoneCarrier() {
	let res = await request(app).post(cellphoneCarrierUrl).send({
		carrierName: 'test carrier',
		domain: 'mailinator.com'
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createMaintenanceRequest(assignedToId, withImages) {
	const params = {
		requestDescription: 'test request',
		assignedToId,
		requestDate: new Date(),
		requestedById: global.signup.user.userId
	};
	// TODO:
	// if (withImages) {
	// 	params.maintenanceRequestImages = [{
	// 		image: 0,
	// 		imageType: 'png'
	// 	}, {
	// 		image: 0,
	// 		imageType: 'jpeg'
	// 	}];
	// }
	let res = await request(app).post(maintenanceRequestUrl).send(params);
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createLookups() {
	const lookups = {};
	lookups.shifts = await createShifts();
	lookups.tasks = await createTasks();
	lookups.generalTasks = await createTasks(1);
	lookups.statuses = [await createStatus()];
	lookups.progressChecklists = [await createProgressChecklist()];
	lookups.users = [];
	lookups.users.push(await createUser({ roles: [], enableTextNotifications: false, enableEmailNotifications: false }));
	lookups.users.push(await createUser({ roles: [], enableTextNotifications: false, enableEmailNotifications: false }));
	lookups.users.push(await createUser({ roles: [], enableTextNotifications: false, enableEmailNotifications: false }));
	lookups.users.push(await createUser({ roles: [], enableTextNotifications: false, enableEmailNotifications: false }));
	lookups.users.push(await createUser({ roles: [], enableTextNotifications: false, enableEmailNotifications: false }));

	let res = await request(app).post(positionsUrl).send({
		positionName: 'Test position'
	});
	expect(res.statusCode).to.eq(201);
	lookups.positions = [res.body];

	res = await request(app).post(attendanceReasonsUrl).send({
		reasonName: 'Test reason'
	});
	expect(res.statusCode).to.eq(201);
	lookups.attendanceReasons = [res.body];

	return lookups;
}

async function createUser({ roles, companyId, enableTextNotifications, enableEmailNotifications,
	emailNotifications, textNotifications }) {
	const carrier = await createCellPhoneCarrier();
	if (!roles)
		roles = []; // Object.keys(constants.ROLE).map(k => constants.ROLE[k].value);
	if (emailNotifications == undefined)
		emailNotifications = Object.keys(constants.NOTIFICATION).map(k => constants.NOTIFICATION[k].value);
	if (textNotifications == undefined)
		textNotifications = Object.keys(constants.NOTIFICATION).map(k => constants.NOTIFICATION[k].value);
	let res = await request(app).post(usersUrl).send({
		email: `e_${guid().substring(0, 25)}@mailinator.com`,
		phoneNumber: `${Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000}`,
		cellPhoneCarrierId: carrier.cellPhoneCarrierId,
		firstName: `f${guid()}`.substring(0, 25),
		lastName: `l${guid()}`.substring(0, 25),
		roles,
		enableTextNotifications: enableTextNotifications == undefined ? false : enableTextNotifications,
		enableEmailNotifications: enableEmailNotifications == undefined ? false : enableEmailNotifications,
		emailNotifications,
		textNotifications,
		companyId: companyId || global.signup.user.companyId
	});

	expect(res.statusCode).to.eq(201);

	const models = require('../models');
	const currUser = await models.user.findById(global.signup.user.userId);

	await models.user.update({
		password: currUser.password
	}, {
			where: { userId: res.body.userId }
		});

	return res.body;
}

async function createEntry({ lookups, shiftId, taskId, userId, enteredById, subtaskId, statusId }) {
	if (!lookups) lookups = (await request(app).get('/api/lookups')).body;;
	let res = await request(app).post(entriesUrl).send({
		entryDate: new Date(),
		taskId: taskId || lookups.tasks[Math.floor(Math.random() * lookups.tasks.length)].taskId,
		shiftId: shiftId || lookups.shifts[Math.floor(Math.random() * lookups.shifts.length)].shiftId,
		userId: userId || lookups.users[Math.floor(Math.random() * lookups.users.length)].userId,
		enteredById: enteredById || lookups.users[Math.floor(Math.random() * lookups.users.length)].userId,
		comments: 'Test entry comments',
		entrySubtasks: [{
			statusId: statusId || lookups.statuses[Math.floor(Math.random() * lookups.statuses.length)].statusId,
			subtaskId: subtaskId || lookups.tasks[Math.floor(Math.random() * lookups.tasks.length)].subtasks[0].subtaskId,
			comments: 'Test subtask comments'
		}]
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createEntries() {
	const lookups = (await request(app).get(lookupsUrl)).body;
	const entry = await createEntry({ lookups });

	res = await request(app).post(generalentriesUrl).send({
		entryDate: new Date(),
		taskId: lookups.tasks[0].taskId,
		userId: lookups.users[0].userId,
		enteredById: lookups.users[0].userId,
		comments: 'Test entry comments',
	});
	expect(res.statusCode).to.eq(201);

	return Promise.resolve({
		entry,
		generalEntry: res.body
	});
}

async function createUserProgressChecklist() {
	const lookups = (await request(app).get(lookupsUrl + '?lookupType=5')).body;
	let res = await request(app).post('/api/userProgressChecklists').send({
		startDate: new Date(),
		progressChecklistId: lookups.progressChecklists[0].progressChecklistId,
		userId: lookups.users[0].userId,
		managerId: lookups.users[0].userId,
	});
	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createAttendance() {
	const lookups = (await request(app).get(lookupsUrl + '?lookupType=3')).body;
	let res = await request(app).post('/api/attendance').send({
		attendanceDate: new Date(),
		userId: lookups.users[0].userId,
		attendanceReasonId: lookups.attendanceReasons[0].attendanceReasonId
	});
	expect(res.statusCode).to.eq(201);
	return Promise.resolve(res.body);
}

async function createSchedule(lookups, userId, scheduleDate, startTime, endTime, published) {
	if (!lookups) lookups = (await request(app).get('/api/lookups')).body;
	const shift = lookups.shifts[Math.floor(Math.random() * lookups.shifts.length)];
	const res = await request(app).post(scheduleUrl).send({
		userId,
		taskId: lookups.tasks[Math.floor(Math.random() * lookups.tasks.length)].taskId,
		shiftId: shift.shiftId,
		scheduleDate: scheduleDate || new Date(),
		startTime: startTime || shift.startTime,
		endTime: endTime || shift.endTime,
		published,
	});

	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createUserAvailability(userId) {
	if (!userId) userId = (await createUser({})).userId;
	const res = await request(app).post(userAvailabilityUrl).send({
		userId,
		dayOfWeek: 0,
		allDay: true,
	});

	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createLeaveRequest(userId, startDate, endDate) {
	if (!userId) userId = (await createUser({})).userId;
	const res = await request(app).post(leaveRequestsUrl).send({
		userId,
		startDate: startDate || new Date(),
		endDate
	});

	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createUserClock(userId) {
	if (!userId) userId = (await createUser({})).userId;
	const res = await request(app).post('/api/userClocks').send({
		userId,
		clockInDate: new Date(),
	});

	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function createUserComment() {
	const user = await createUser({ roles: [] });
	const res = await request(app).post('/api/userComments').send({
		comment: "test comment",
		commentDate: new Date(),
		userId: user.userId
	});

	expect(res.statusCode).to.eq(201);
	return res.body;
}

async function getEmails() {
	const models = require('../models');
	const emls = await models.emailQueue.findAll({ include: { model: models.emailQueueAttachment, as: 'emailQueueAttachments' } });
	emls.forEach(e => {
		e.bcc = e.tos;
		if (e.isText) {
			e.text = e.body;
		}
		else {
			e.html = e.body;
		}
	});
	return emls
}

async function deleteEmails() {
	const models = require('../models');
	await models.db.query(`
		delete from email_queue_attachment;
	`);
	await models.db.query(`
		delete from email_queue;
	`);
}

function getJWT(user, dontRememberMe) {
	return jwt.sign({ email: user.email, rememberMe: dontRememberMe == true ? false : true }, JWT_KEY)
}


async function deleteData() {
	const deleteTbls = [
		'inventory_transaction',
		'inventory_item',
		'inventory_category',
		'vendor',
		'schedule_trade',
		'schedule',
		'schedule_template',
		'entry_subtask',
		'user_entry_queue',
		'user_subtask',
		'entry',
		'subtask',
		'task',
		'shift',
		'status',
		'maintenance_request_image',
		'maintenance_request_reply',
		'maintenance_request',
		'leave_request',
		'user_comment',
		'user_note',
		'user_availability',
		'user_clock',
		'user_progress_item',
		'user_progress_checklist',
		'user_comment',
		'user_comment_reply',
		'attendance',
		'user',
		'position',
		'progress_item',
		'progress_checklist',
		'email_template',
		'attendance_reason',
		'cell_phone_carrier',
		'pay_rate',
		'company',
	];
	const models = require('../models');
	await models.db.query(`
      SET session_replication_role = replica;
      DELETE FROM "${deleteTbls.join('"; DELETE FROM "')}";
	  SET session_replication_role = DEFAULT;
	  select * from company
    `);

	await deleteEmails();
}


module.exports = {
	createLookups,
	createEntry,
	createEntries,
	createSchedule,
	createUserAvailability,
	createLeaveRequest,
	createAttendance,
	createUser,
	createTasks,
	createShifts,
	createStatus,
	createInventoryCategory,
	createVendor,
	createCellPhoneCarrier,
	createMaintenanceRequest,
	createUserComment,
	createUserClock,
	createUserProgressChecklist,
	signup,
	getEmails,
	deleteEmails,
	createInventoryItem,
	getJWT,
	deleteData,
}