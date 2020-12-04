require('dotenv').config();
const modelhelpers = require('../helpers/modelhelpers.js');
const Sequelize = require('sequelize');
// const winston = require('winston')

let db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT || 5432,
	dialect: process.env.DB_DIALECT,
	dialectOptions: { decimalNumbers: true },
	logging: false // process.env.NODE_ENV != 'test' ? winston.info : null,
});
let models = { db, Sequelize };
let modelDeclares = {};
modelDeclares.attendance = require('./attendance');
modelDeclares.company = require('./company');
modelDeclares.user = require('./user');
modelDeclares.shift = require('./shift');
modelDeclares.task = require('./task');
modelDeclares.status = require('./status');
modelDeclares.attendanceReason = require('./attendanceReason');
modelDeclares.subtask = require('./subtask');
modelDeclares.entry = require('./entry');
modelDeclares.userEntryQueue = require('./userEntryQueue');
modelDeclares.userSubtask = require('./userSubtask');
modelDeclares.userComment = require('./userComment');
modelDeclares.userCommentReply = require('./userCommentReply');
modelDeclares.entrySubtask = require('./entrySubtask');
modelDeclares.emailTemplate = require('./emailTemplate');
modelDeclares.scheduleTemplate = require('./scheduleTemplate');
modelDeclares.position = require('./position');
modelDeclares.inventoryItem = require('./inventoryItem');
modelDeclares.inventoryTransaction = require('./inventoryTransaction');
modelDeclares.vendor = require('./vendor');
modelDeclares.inventoryCategory = require('./inventoryCategory');
modelDeclares.maintenanceRequest = require('./maintenanceRequest');
modelDeclares.maintenanceRequestImage = require('./maintenanceRequestImage');
modelDeclares.maintenanceRequestReply = require('./maintenanceRequestReply');
modelDeclares.payRate = require('./payRate');
modelDeclares.schedule = require('./schedule');
modelDeclares.userAvailability = require('./userAvailability');
modelDeclares.leaveRequest = require('./leaveRequest');
modelDeclares.contactUs = require('./contactUs');
modelDeclares.demoRequest = require('./demoRequest');
modelDeclares.cellPhoneCarrier = require('./cellPhoneCarrier');
modelDeclares.userClock = require('./userClock');
modelDeclares.userNote = require('./userNote');
modelDeclares.scheduleTrade = require('./scheduleTrade');
modelDeclares.userTaskQueue = require('./userTaskQueue');
modelDeclares.progressChecklist = require('./progressChecklist');
modelDeclares.progressItem = require('./progressItem');
modelDeclares.userProgressChecklist = require('./userProgressChecklist');
modelDeclares.userProgressItem = require('./userProgressItem');
modelDeclares.emailQueue = require('./emailQueue');
modelDeclares.emailQueueAttachment = require('./emailQueueAttachment');
modelDeclares.document = require('./document');

for (let md in modelDeclares) {
	models[md] = modelDeclares[md].defineModel(db, Sequelize)
}

models.company = Object.assign(models.company, require('./extensions/company'));
models.user = Object.assign(models.user, require('./extensions/user'));
models.task = Object.assign(models.task, require('./extensions/task'));
models.entry = Object.assign(models.entry, require('./extensions/entry'));
models.inventoryTransaction = Object.assign(models.inventoryTransaction, require('./extensions/inventoryTransaction'));
models.inventoryItem = Object.assign(models.inventoryItem, require('./extensions/inventoryItem'));
models.attendance = Object.assign(models.attendance, require('./extensions/attendance'));
models.scheduleTemplate = Object.assign(models.scheduleTemplate, require('./extensions/scheduleTemplate'));
models.userComment = Object.assign(models.userComment, require('./extensions/userComment'));
models.userCommentReply = Object.assign(models.userCommentReply, require('./extensions/userCommentReply'));
models.maintenanceRequest = Object.assign(models.maintenanceRequest, require('./extensions/maintenanceRequest'));
models.maintenanceRequestReply = Object.assign(models.maintenanceRequestReply, require('./extensions/maintenanceRequestReply'));
models.maintenanceRequestImage = Object.assign(models.maintenanceRequestImage, require('./extensions/maintenanceRequestImage'));
models.schedule = Object.assign(models.schedule, require('./extensions/schedule'));
models.leaveRequest = Object.assign(models.leaveRequest, require('./extensions/leaveRequest'));
models.userAvailability = Object.assign(models.userAvailability, require('./extensions/userAvailability'));
models.userClock = Object.assign(models.userClock, require('./extensions/userClock'));
models.contactUs = Object.assign(models.contactUs, require('./extensions/contactUs'));
models.demoRequest = Object.assign(models.demoRequest, require('./extensions/demoRequest'));
models.scheduleTrade = Object.assign(models.scheduleTrade, require('./extensions/scheduleTrade'));
models.progressChecklist = Object.assign(models.progressChecklist, require('./extensions/progressChecklist'));
models.userProgressChecklist = Object.assign(models.userProgressChecklist, require('./extensions/userProgressChecklist'));
models.vendor = Object.assign(models.vendor, require('./extensions/vendor'));
models.inventoryCategory = Object.assign(models.inventoryCategory, require('./extensions/inventoryCategory'));
models.document = Object.assign(models.document, require('./extensions/document'));

for (let md in modelDeclares) {
	modelDeclares[md].createAssociations(models);
}

module.exports = models;