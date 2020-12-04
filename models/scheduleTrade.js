// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('schedule_trade', {
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'scheduleId': {
			type: DataTypes.UUID,
			field: 'schedule_id',
			allowNull: false,
		},
		'scheduleTradeId': {
			type: DataTypes.UUID,
			field: 'schedule_trade_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'tradeForScheduleId': {
			type: DataTypes.UUID,
			field: 'trade_for_schedule_id',
			allowNull: true,
		},
		'tradeStatus': {
			type: DataTypes.INTEGER,
			field: 'trade_status',
			allowNull: false,
			defaultValue: 0,
		},
		'tradeUserId': {
			type: DataTypes.UUID,
			field: 'trade_user_id',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.scheduleTrade.belongsTo(models.schedule, {
		as: 'schedule',
		foreignKey: {
			name: 'scheduleId',
			field: 'schedule_id'
		},
		targetKey: 'scheduleId'
	});
	models.scheduleTrade.belongsTo(models.schedule, {
		as: 'tradeForSchedule',
		foreignKey: {
			name: 'tradeForScheduleId',
			field: 'trade_for_schedule_id'
		},
		targetKey: 'scheduleId'
	});
	models.scheduleTrade.belongsTo(models.user, {
		as: 'tradeUser',
		foreignKey: {
			name: 'tradeUserId',
			field: 'trade_user_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};