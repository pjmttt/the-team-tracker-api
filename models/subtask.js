// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('subtask', {
		'sequence': {
			type: DataTypes.INTEGER,
			field: 'sequence',
			allowNull: false,
			defaultValue: 0,
		},
		'subtaskId': {
			type: DataTypes.UUID,
			field: 'subtask_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'subtaskName': {
			type: DataTypes.STRING,
			field: 'subtask_name',
			allowNull: false,
		},
		'taskId': {
			type: DataTypes.UUID,
			field: 'task_id',
			allowNull: true,
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
	models.subtask.hasMany(models.entrySubtask, {
		as: 'entrySubtasks',
		foreignKey: {
			name: 'subtaskId',
			field: 'subtask_id'
		},
		targetKey: 'subtaskId'
	});
	models.subtask.hasMany(models.userSubtask, {
		as: 'userSubtasks',
		foreignKey: {
			name: 'subtaskId',
			field: 'subtask_id'
		},
		targetKey: 'subtaskId'
	});
	models.subtask.belongsTo(models.task, {
		as: 'task',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};