// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('progress_item', {
		'itemDescription': {
			type: DataTypes.STRING,
			field: 'item_description',
			allowNull: false,
		},
		'progressChecklistId': {
			type: DataTypes.UUID,
			field: 'progress_checklist_id',
			allowNull: false,
		},
		'progressItemId': {
			type: DataTypes.UUID,
			field: 'progress_item_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'sequence': {
			type: DataTypes.INTEGER,
			field: 'sequence',
			allowNull: false,
			defaultValue: 0,
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
	models.progressItem.hasMany(models.userProgressItem, {
		as: 'userProgressItems',
		foreignKey: {
			name: 'progressItemId',
			field: 'progress_item_id'
		},
		targetKey: 'progressItemId'
	});
	models.progressItem.belongsTo(models.progressChecklist, {
		as: 'progressChecklist',
		foreignKey: {
			name: 'progressChecklistId',
			field: 'progress_checklist_id'
		},
		targetKey: 'progressChecklistId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};