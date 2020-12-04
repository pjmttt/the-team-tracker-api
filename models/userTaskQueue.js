// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_task_queue', {
		'entryIds': {
			type: DataTypes.ARRAY(DataTypes.UUID),
			field: 'entry_ids',
			allowNull: false,
		},
		'taskId': {
			type: DataTypes.UUID,
			field: 'task_id',
			allowNull: false,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
		'userTaskQueueId': {
			type: DataTypes.UUID,
			field: 'user_task_queue_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userTaskQueue.belongsTo(models.task, {
		as: 'task',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.userTaskQueue.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};