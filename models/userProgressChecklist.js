// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_progress_checklist', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: true,
		},
		'completedDate': {
			type: DataTypes.DATEONLY,
			field: 'completed_date',
			allowNull: true,
		},
		'managerId': {
			type: DataTypes.UUID,
			field: 'manager_id',
			allowNull: false,
		},
		'progressChecklistId': {
			type: DataTypes.UUID,
			field: 'progress_checklist_id',
			allowNull: false,
		},
		'startDate': {
			type: DataTypes.DATEONLY,
			field: 'start_date',
			allowNull: false,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
		'userProgressChecklistId': {
			type: DataTypes.UUID,
			field: 'user_progress_checklist_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userProgressChecklist.hasMany(models.userProgressItem, {
		as: 'userProgressItems',
		foreignKey: {
			name: 'userProgressChecklistId',
			field: 'user_progress_checklist_id'
		},
		targetKey: 'userProgressChecklistId'
	});
	models.userProgressChecklist.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.userProgressChecklist.belongsTo(models.progressChecklist, {
		as: 'progressChecklist',
		foreignKey: {
			name: 'progressChecklistId',
			field: 'progress_checklist_id'
		},
		targetKey: 'progressChecklistId'
	});
	models.userProgressChecklist.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.userProgressChecklist.belongsTo(models.user, {
		as: 'manager',
		foreignKey: {
			name: 'managerId',
			field: 'manager_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};