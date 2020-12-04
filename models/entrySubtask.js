// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('entry_subtask', {
		'addressed': {
			type: DataTypes.BOOLEAN,
			field: 'addressed',
			allowNull: false,
			defaultValue: false,
		},
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'enteredById': {
			type: DataTypes.UUID,
			field: 'entered_by_id',
			allowNull: true,
		},
		'entryId': {
			type: DataTypes.UUID,
			field: 'entry_id',
			allowNull: false,
		},
		'entrySubtaskId': {
			type: DataTypes.UUID,
			field: 'entry_subtask_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'statusId': {
			type: DataTypes.UUID,
			field: 'status_id',
			allowNull: true,
		},
		'subtaskId': {
			type: DataTypes.UUID,
			field: 'subtask_id',
			allowNull: false,
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
	models.entrySubtask.belongsTo(models.entry, {
		as: 'entry',
		foreignKey: {
			name: 'entryId',
			field: 'entry_id'
		},
		targetKey: 'entryId'
	});
	models.entrySubtask.belongsTo(models.status, {
		as: 'status',
		foreignKey: {
			name: 'statusId',
			field: 'status_id'
		},
		targetKey: 'statusId'
	});
	models.entrySubtask.belongsTo(models.subtask, {
		as: 'subtask',
		foreignKey: {
			name: 'subtaskId',
			field: 'subtask_id'
		},
		targetKey: 'subtaskId'
	});
	models.entrySubtask.belongsTo(models.user, {
		as: 'enteredBy',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};