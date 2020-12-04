// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_progress_item', {
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'completedById': {
			type: DataTypes.UUID,
			field: 'completed_by_id',
			allowNull: true,
		},
		'completedDate': {
			type: DataTypes.DATEONLY,
			field: 'completed_date',
			allowNull: true,
		},
		'progressItemId': {
			type: DataTypes.UUID,
			field: 'progress_item_id',
			allowNull: false,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: false,
		},
		'userProgressChecklistId': {
			type: DataTypes.UUID,
			field: 'user_progress_checklist_id',
			allowNull: false,
		},
		'userProgressItemId': {
			type: DataTypes.UUID,
			field: 'user_progress_item_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userProgressItem.belongsTo(models.progressItem, {
		as: 'progressItem',
		foreignKey: {
			name: 'progressItemId',
			field: 'progress_item_id'
		},
		targetKey: 'progressItemId'
	});
	models.userProgressItem.belongsTo(models.user, {
		as: 'completedBy',
		foreignKey: {
			name: 'completedById',
			field: 'completed_by_id'
		},
		targetKey: 'userId'
	});
	models.userProgressItem.belongsTo(models.userProgressChecklist, {
		as: 'userProgressChecklist',
		foreignKey: {
			name: 'userProgressChecklistId',
			field: 'user_progress_checklist_id'
		},
		targetKey: 'userProgressChecklistId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};