// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('progress_checklist', {
		'checklistName': {
			type: DataTypes.STRING,
			field: 'checklist_name',
			allowNull: false,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'progressChecklistId': {
			type: DataTypes.UUID,
			field: 'progress_checklist_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.progressChecklist.hasMany(models.progressItem, {
		as: 'progressItems',
		foreignKey: {
			name: 'progressChecklistId',
			field: 'progress_checklist_id'
		},
		targetKey: 'progressChecklistId'
	});
	models.progressChecklist.hasMany(models.userProgressChecklist, {
		as: 'userProgressChecklists',
		foreignKey: {
			name: 'progressChecklistId',
			field: 'progress_checklist_id'
		},
		targetKey: 'progressChecklistId'
	});
	models.progressChecklist.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};