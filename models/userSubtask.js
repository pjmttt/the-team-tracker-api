// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_subtask', {
		'entrySubtaskIds': {
			type: DataTypes.ARRAY(DataTypes.UUID),
			field: 'entry_subtask_ids',
			allowNull: true,
		},
		'statusId': {
			type: DataTypes.UUID,
			field: 'status_id',
			allowNull: false,
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
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
		'userSubtaskId': {
			type: DataTypes.UUID,
			field: 'user_subtask_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userSubtask.belongsTo(models.status, {
		as: 'status',
		foreignKey: {
			name: 'statusId',
			field: 'status_id'
		},
		targetKey: 'statusId'
	});
	models.userSubtask.belongsTo(models.subtask, {
		as: 'subtask',
		foreignKey: {
			name: 'subtaskId',
			field: 'subtask_id'
		},
		targetKey: 'subtaskId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};