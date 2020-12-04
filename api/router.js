const router = require('express').Router();
const apihelper = require('../helpers/apihelper');
const emailhelper = require('../helpers/emailhelper');
const models = require('../models');
const auth = require('../utils/authorization');
const location = require('../utils/location');
const helpers = require('../helpers/helpers');
const confighelper = require('../helpers/confighelper');
const modelhelpers = require('../helpers/modelhelpers');
const { ROLE, MODULE } = require('../models/constants');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage })

apihelper.generateApi('/users', models.user, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/shifts', models.shift, models, router, [MODULE.DUTIES.value, MODULE.SCHEDULING.value], [ROLE.ADMIN.value]);
apihelper.generateApi('/statuses', models.status, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/attendanceReasons', models.attendanceReason, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/tasks', models.task, models, router, [MODULE.DUTIES.value, MODULE.SCHEDULING.value], [ROLE.ADMIN.value]);
apihelper.generateApi('/generalTasks', models.task, models, router, [MODULE.DUTIES.value, MODULE.SCHEDULING.value], [ROLE.ADMIN.value]);
apihelper.generateApi('/schedules', models.schedule, models, router, [MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value], -1);
apihelper.generateApi('/positions', models.position, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/cellPhoneCarriers', models.cellPhoneCarrier, models, router, null, [ROLE.ADMIN.value], -1);
apihelper.generateApi('/documents', models.document, models, router, null, [ROLE.ADMIN.value], -1);
apihelper.generateApi('/entries', models.entry, models, router, [MODULE.DUTIES.value], ROLE.MANAGER.value, -1);
apihelper.generateApi('/generalentries', models.entry, models, router, [MODULE.DUTIES.value], ROLE.MANAGER.value, -1);
apihelper.generateApi('/companies', models.company, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/attendance', models.attendance, models, router, [MODULE.DUTIES.value, MODULE.SCHEDULING.value], [ROLE.MANAGER.value, ROLE.SCHEDULING.value], -1);
apihelper.generateApi('/inventoryCategories', models.inventoryCategory, models, router, [MODULE.INVENTORY.value], ROLE.INVENTORY.value);
apihelper.generateApi('/inventoryItems', models.inventoryItem, models, router, [MODULE.INVENTORY.value], ROLE.INVENTORY.value);
apihelper.generateApi('/maintenanceRequests', models.maintenanceRequest, models, router, [MODULE.MAINTENANCE_REQUESTS.value], [ROLE.MAINTENANCE_REQUESTS.value, ROLE.MANAGER.value]);
apihelper.generateApi('/maintenanceRequestReplys', models.maintenanceRequestReply, models, router, [MODULE.MAINTENANCE_REQUESTS.value], [ROLE.MAINTENANCE_REQUESTS.value, ROLE.MANAGER.value]);
apihelper.generateDeleteApi('/maintenanceRequestImages', models.maintenanceRequestImage, models, router, [MODULE.MAINTENANCE_REQUESTS.value]);
apihelper.generateApi('/inventoryTransactions', models.inventoryTransaction, models, router, [MODULE.INVENTORY.value], ROLE.INVENTORY.value);
apihelper.generateApi('/vendors', models.vendor, models, router, [MODULE.INVENTORY.value], ROLE.INVENTORY.value);
apihelper.generateApi('/payRates', models.payRate, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/userComments', models.userComment, models, router);
apihelper.generateApi('/userCommentReplys', models.userCommentReply, models, router);
apihelper.generateApi('/contactUs', models.contactUs, models, router);
apihelper.generateApi('/requestDemo', models.demoRequest, models, router);
apihelper.generateApi('/scheduleTemplates', models.scheduleTemplate, models, router, [MODULE.SCHEDULING.value], ROLE.SCHEDULING.value);
apihelper.generateApi('/userNotes', models.userNote, models, router, null, ROLE.ADMIN.value);
apihelper.generateApi('/emailTemplates', models.emailTemplate, models, router, null, [ROLE.ADMIN.value]);
apihelper.generateApi('/leaveRequests', models.leaveRequest, models, router, [MODULE.SCHEDULING.value]);
apihelper.generateApi('/userAvailability', models.userAvailability, models, router, [MODULE.SCHEDULING.value]);
apihelper.generateApi('/userClocks', models.userClock, models, router, [MODULE.SCHEDULING.value]);
apihelper.generateGetApi('/scheduleTrades', models.scheduleTrade, models, router, [MODULE.SCHEDULING.value]);
apihelper.generateDeleteApi('/scheduleTrades', models.scheduleTrade, models, router, [MODULE.SCHEDULING.value]);
apihelper.generateApi('/progressChecklists', models.progressChecklist, models, router, [MODULE.DUTIES.value], [ROLE.ADMIN.value]);
apihelper.generateApi('/userProgressChecklists', models.userProgressChecklist, models, router, [MODULE.DUTIES.value], ROLE.MANAGER.value, -1);

async function processRequest(promise, res, next, modules, roles) {
	try {
		if ((roles && !roles.some(r => res.locals.user.roles.includes(r))) ||
			(modules && res.locals.user && !res.locals.user.company.modules.some(m => modules.includes(m)))
		) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		const results = await promise;
		return res.status(200).json(results);
	}
	catch (e) {
		return apihelper.createErrorResponse(res, e);
	}
}

router.post('/login', async (req, res, next) =>
	await processRequest(auth.validateUser(req.body.email, req.body.password, req.body.mobile, req.body.rememberMe, req, res), res, next));

router.post('/clockIn', async (req, res, next) =>
	await processRequest(auth.clockInOut(true, req.body.email, req.body.password, req, res), res, next, [MODULE.SCHEDULING.value]));

router.post('/clockOut', async (req, res, next) =>
	await processRequest(auth.clockInOut(false, req.body.email, req.body.password, req, res), res, next, [MODULE.SCHEDULING.value]));

router.post('/clockInOutById', async (req, res, next) =>
	await processRequest(auth.clockInOutById(req.body.userId, req, res), res, next, [MODULE.SCHEDULING.value]));

router.post('/signup', async (req, res, next) =>
	await processRequest(auth.signup(req.body.user, req.body.company, req.body.password, req, res), res, next));

router.post('/ping', async (req, res, next) =>
	await processRequest(auth.ping(req), res, next));

router.get('/ipaddress', async (req, res, next) =>
	await processRequest(location.getIpAddress(req), res, next));

router.post('/forgotPassword', async (req, res, next) =>
	await processRequest(auth.forgotPassword(req.body.email), res, next));

router.post('/resetPassword', async (req, res, next) =>
	await processRequest(auth.resetPassword(req.body.key, req.body.password), res, next));

router.get('/lookups', async (req, res, next) =>
	await processRequest(helpers.getLookups(res.locals.user.companyId, req, res), res, next));


router.post('/bulkemailtemplates', async (req, res, next) =>
	await processRequest(confighelper.updateEmailTemplates(req.body, req, res), res, next, [ROLE.ADMIN.value]));

router.post('/statusChangedComments', async (req, res, next) =>
	await processRequest(helpers.sendStatusChangedComments(req.body, req, res), res, next));

router.post('/entriesFromSchedule', async (req, res, next) =>
	await processRequest(helpers.entriesFromSchedule(req.body.forDate, req, res), res, next, [MODULE.SCHEDULING.value], [ROLE.MANAGER.value, ROLE.ADMIN.value]));

router.post('/searchEntries', async (req, res, next) =>
	await processRequest(models.entry.searchEntries(models, req.body, req, res), res, next, [MODULE.DUTIES.value], [ROLE.MANAGER.value, ROLE.ADMIN.value]));

router.post('/sendEntries', async (req, res, next) =>
	await processRequest(models.entry.sendEntries(models, req, res), res, next, [MODULE.DUTIES.value], [ROLE.MANAGER.value, ROLE.ADMIN.value]));

router.post('/pickupEntry', async (req, res, next) =>
	await processRequest(models.entry.pickupEntry(models, req.body, req, res), res, next, [MODULE.DUTIES.value]));

router.post('/sendSchedules', async (req, res, next) =>
	await processRequest(models.schedule.sendSchedules(req, res, models), res, next, [MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.post('/deleteSchedules', async (req, res, next) =>
	await processRequest(models.schedule.deleteSchedules(req, res, models), res, next, [MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.post('/publishSchedules', async (req, res, next) =>
	await processRequest(models.schedule.publishSchedules(req, res, models), res, next, [MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.post('/schedulesFromPrevious', async (req, res, next) =>
	await processRequest(models.schedule.schedulesFromPrevious(req.body.forDate, req, res, models), res, next,
		[MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.post('/schedulesFromTemplate/:id', async (req, res, next) =>
	await processRequest(models.schedule.schedulesFromTemplate(req.params.id, req.body.forDate, req, res, models), res, next,
		[MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.get('/maintenanceRequestImages/:id', async (req, res, next) => {
	try {
		const img = await models.maintenanceRequestImage.getImage(models, req.params.id, res.locals.user);
		res.header('content-type', img.imageType);
		return res.status(200).send(img.image ? img.image[0] : null);
	}
	catch (e) {
		next(e);
	}
});

router.post('/requestSubscription', async (req, res, next) =>
	await processRequest(models.company.requestSubscription(req.body, models, res), res, next));

router.post('/processPayment', async (req, res, next) =>
	await processRequest(models.company.processPayment(req.body.requestNumber, req.body.transactionNumber, models, res), res, next));

router.put('/maintenanceRequestImage/:id', upload.array('file'), async (req, res, next) =>
	await processRequest(models.maintenanceRequestImage.uploadImage(models, req.files, req.params.id, res.locals.user), res, next, [MODULE.MAINTENANCE_REQUESTS.value]));

// LEGACY
router.get('/maintenanceRequests/:maintenanceRequestId/images', async (req, res, next) =>
	await processRequest(models.maintenanceRequestImage.getImagesWithContent(models, req.params.maintenanceRequestId, res.locals.user, req, res), res, next, [MODULE.MAINTENANCE_REQUESTS.value]));

router.post('/uploadDocuments', upload.array('file'), async (req, res, next) =>
	await processRequest(models.document.uploadDocuments(models, req.files, res.locals.user), res, next));

router.get('/downloadDocument/:documentId', async (req, res, next) => {
	try {
		const result = await models.document.downloadDocument(models, req.params.documentId, res.locals.user);
		return res.status(200)
			.set('Content-Type', result.contentType)
			.set(`Content-disposition', 'attachment; filename=${result.fileName}`)
			.end(result.content[0]);
	}
	catch (e) {
		next(e);
	}
});

router.post('/postTrade', async (req, res, next) =>
	await processRequest(models.scheduleTrade.postTrade(req.body.scheduleId, res.locals.user, models, req, res), res, next, [MODULE.SCHEDULING.value]));

router.put('/requestTrade/:id', async (req, res, next) =>
	await processRequest(models.scheduleTrade.requestTrade(req.params.id, req.body.tradeForScheduleId, res.locals.user, models), res, next, [MODULE.SCHEDULING.value]));

router.put('/acceptDeclineTrade/:id', async (req, res, next) =>
	await processRequest(models.scheduleTrade.acceptDeclineTrade(req.params.id, req.body.accept, req.body.comments, res.locals.user, models), res, next, [MODULE.SCHEDULING.value]));

router.put('/approveDenyTrade/:id', async (req, res, next) =>
	await processRequest(models.scheduleTrade.approveDenyTrade(req.params.id, req.body.approve, req.body.comments, res.locals.user, models), res, next, [MODULE.SCHEDULING.value], [ROLE.SCHEDULING.value, ROLE.ADMIN.value]));

router.post('/sendInvitation', async (req, res, next) =>
	await processRequest(helpers.sendInvitation(req.body.userId, req, res), res, next, null, [ROLE.ADMIN.value]));

router.get('/mySettings', async (req, res, next) => {
	try {
		return res.status(200).json(modelhelpers.getFormattedResult(await models.user.findById(res.locals.user.userId), models.user, req, res));
	}
	catch (e) {
		next(e);
	}
});

router.put('/mySettings/:id', async (req, res, next) => {
	try {
		if (res.locals.user.userId != req.params.id) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		const results = await models.user.updateUserSettings(req.body, req.params.id, models);
		return res.status(200).json(results);
	}
	catch (e) {
		next(e);
	}
});

router.get('/sendEmails', async (req, res, next) => {
	try {
		await emailhelper.processEmailQueue();
		return res.status(200).send();
	}
	catch (e) {
		next(e);
	}
});


module.exports = router;