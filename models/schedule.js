// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('schedule', {
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'dayOfWeek': {
			type: DataTypes.INTEGER,
			field: 'day_of_week',
			allowNull: true,
		},
		'endTime': {
			type: DataTypes.DATE,
			field: 'end_time',
			allowNull: false,
		},
		'notes': {
			type: DataTypes.STRING,
			field: 'notes',
			allowNull: true,
		},
		'published': {
			type: DataTypes.BOOLEAN,
			field: 'published',
			allowNull: false,
			defaultValue: false,
		},
		'scheduleDate': {
			type: DataTypes.DATEONLY,
			field: 'schedule_date',
			allowNull: true,
		},
		'scheduleId': {
			type: DataTypes.UUID,
			field: 'schedule_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'scheduleTemplateId': {
			type: DataTypes.UUID,
			field: 'schedule_template_id',
			allowNull: true,
		},
		'shiftId': {
			type: DataTypes.UUID,
			field: 'shift_id',
			allowNull: false,
		},
		'startTime': {
			type: DataTypes.DATE,
			field: 'start_time',
			allowNull: false,
		},
		'taskId': {
			type: DataTypes.UUID,
			field: 'task_id',
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
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.schedule.hasMany(models.scheduleTrade, {
		as: 'scheduleTrades',
		foreignKey: {
			name: 'scheduleId',
			field: 'schedule_id'
		},
		targetKey: 'scheduleId'
	});
	models.schedule.hasMany(models.scheduleTrade, {
		as: 'tradeForScheduleScheduleTrades',
		foreignKey: {
			name: 'tradeForScheduleId',
			field: 'trade_for_schedule_id'
		},
		targetKey: 'scheduleId'
	});
	models.schedule.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.schedule.belongsTo(models.scheduleTemplate, {
		as: 'scheduleTemplate',
		foreignKey: {
			name: 'scheduleTemplateId',
			field: 'schedule_template_id'
		},
		targetKey: 'scheduleTemplateId'
	});
	models.schedule.belongsTo(models.shift, {
		as: 'shift',
		foreignKey: {
			name: 'shiftId',
			field: 'shift_id'
		},
		targetKey: 'shiftId'
	});
	models.schedule.belongsTo(models.task, {
		as: 'task',
		foreignKey: {
			name: 'taskId',
			field: 'task_id'
		},
		targetKey: 'taskId'
	});
	models.schedule.belongsTo(models.user, {
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