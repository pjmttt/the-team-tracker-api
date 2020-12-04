// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('task', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'difficulty': {
			type: DataTypes.INTEGER,
			field: 'difficulty',
			allowNull: true,
		},
		'notifyAfter': {
			type: DataTypes.INTEGER,
			field: 'notify_after',
			allowNull: false,
			defaultValue: 0,
		},
		'taskId': {
			type: DataTypes.UUID,
			field: 'task_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'taskName': {
			type: DataTypes.STRING,
			field: 'task_name',
			allowNull: false,
		},
		'taskType': {
			type: DataTypes.INTEGER,
			field: 'task_type',
			allowNull: true,
			defaultValue: 0,
		},
		'textColor': {
			type: DataTypes.STRING,
			field: 'text_color',
			allowNull: true,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.task.hasMany(models.entry, {
		as: 'entrys',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.task.hasMany(models.schedule, {
		as: 'schedules',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.task.hasMany(models.subtask, {
		as: 'subtasks',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.task.hasMany(models.userTaskQueue, {
		as: 'userTaskQueues',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.task.belongsTo(models.company, {
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