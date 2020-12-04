
const emailTemplatesData = require('../data/emailTemplate.json');
const attendanceReasonsData = require('../data/attendanceReason.json');
const cellPhoneCarriersData = require('../data/cellPhoneCarrier.json');
const inventoryCategoriesData = require('../data/inventoryCategory.json');
const inventoryItemsData = require('../data/inventoryItem.json');
const payRatesData = require('../data/payRate.json');
const positionsData = require('../data/position.json');
const progressChecklistsData = require('../data/progressChecklist.json');
const shiftsData = require('../data/shift.json');
const statusesData = require('../data/status.json');
const tasksData = require('../data/task.json');
const vendorsData = require('../data/vendor.json');
const usersData = require('../data/user.json');

async function populateDefaults(models, userId, company, transaction) {
	const filtExpr = (obj) => {
		if (process.env.NODE_ENV != 'test') {
			return obj.insertOnSubscribe;
		}
		return true;
	}

	const companyId = company.companyId;
	const emailTemplates = await models.emailTemplate.bulkCreate(emailTemplatesData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const attendanceReasons = await models.attendanceReason.bulkCreate(attendanceReasonsData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const cellPhoneCarriers = await models.cellPhoneCarrier.bulkCreate(cellPhoneCarriersData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const inventoryCategories = await models.inventoryCategory.bulkCreate(inventoryCategoriesData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const payRates = await models.payRate.bulkCreate(payRatesData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const positions = await models.position.bulkCreate(positionsData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const shifts = await models.shift.bulkCreate(shiftsData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });
	const vendors = await models.vendor.bulkCreate(vendorsData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });

	for (let i of inventoryItemsData.filter(filtExpr)) {
		if (i.vendorName) {
			i.vendorId = vendors.find(v => v.vendorName == i.vendorName).vendorId;
		}
		if (i.categoryName) {
			i.inventoryCategoryId = inventoryCategories.find(c => c.categoryName == i.categoryName).inventoryCategoryId;
		}
	}
	const inventoryItems = await models.inventoryItem.bulkCreate(inventoryItemsData.filter(filtExpr).map(x => Object.assign({ companyId, updatedBy: userId }, x)), { transaction });

	const tasks = [];
	for (let t of tasksData.filter(filtExpr)) {
		const createdTask = await models.task.create(Object.assign({ companyId, updatedBy: userId }, t), { transaction });
		if (t.subtasks) {
			createdTask.subtasks = await models.subtask.bulkCreate(t.subtasks.map(st => Object.assign({ taskId: createdTask.taskId, updatedBy: userId }, st)), { transaction });
		}
		tasks.push(createdTask);
	}

	const progressChecklists = [];
	for (let pc of progressChecklistsData.filter(filtExpr)) {
		const created = await models.progressChecklist.create(Object.assign({ companyId, updatedBy: userId }, pc), { transaction });
		if (pc.items) {
			created.progressItems = await models.progressItem.bulkCreate(pc.items.map(i => Object.assign({
				progressChecklistId: created.progressChecklistId,
				updatedBy: userId
			}, i)), { transaction });
		}
		progressChecklists.push(created);
	}

	const statuses = [];
	for (let st of statusesData.filter(filtExpr)) {
		let createdEmailTemplate = null;
		if (st.managerEmailTemplate) {
			createdEmailTemplate = await models.emailTemplate.create(Object.assign({
				companyId,
				updatedBy: userId
			}, st.managerEmailTemplate), { transaction });
		}

		const status = await models.status.create(Object.assign({
			companyId,
			updatedBy: userId,
			managerEmailTemplateId: createdEmailTemplate.emailTemplateId
		}, st), { transaction });

		if (createdEmailTemplate) {
			status.managerEmailTemplate = createdEmailTemplate;
		}
		statuses.push(status);
	}

	// const usersToCreate = [];
	// for (let u of usersData) {
	// 	usersToCreate.push(Object.assign({
	// 		showOnSchedule: true,
	// 		enableEmailNotifications: true,
	// 		enableTextNotifications: true,
	// 		email: `${u.positionName.replace(/ /g, '_').toLowerCase()}@${company.companyName.replace(/ /g, '_').toLowerCase()}.com`,
	// 		userName: `${u.positionName.replace(/ /g, '_').toLowerCase()}@${company.companyName.replace(/ /g, '_').toLowerCase()}.com`,
	// 		firstName: u.positionName,
	// 		lastName: '1',
	// 		password: '!!!NOTSET!!!',
	// 		positionId: positions.find(p => p.positionName === u.positionName).positionId,
	// 		companyId
	// 	}, u))
	// }

	// const users = await models.user.bulkCreate(usersToCreate, { transaction });

	return {
		emailTemplates,
		attendanceReasons,
		cellPhoneCarriers,
		inventoryCategories,
		payRates,
		positions,
		shifts,
		vendors,
		inventoryItems,
		tasks, progressChecklists,
		statuses,
		// users
	};
}

async function getEmailTemplate(models, templateType, companyId, userId) {
	let emailTemplate = await models.emailTemplate.findOne({
		where: {
			companyId,
			templateType
		}
	});
	if (!emailTemplate) {
		const toInsert = Object.assign({}, emailTemplatesData.find(t => t.templateType == templateType));
		toInsert.companyId = companyId;
		toInsert.updatedBy = userId;
		emailTemplate = await models.emailTemplate.create(toInsert);
	}
	return emailTemplate;
}

module.exports = {
	populateDefaults,
	getEmailTemplate,
}