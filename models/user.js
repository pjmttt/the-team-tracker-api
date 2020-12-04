// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user', {
		'cellPhoneCarrierId': {
			type: DataTypes.UUID,
			field: 'cell_phone_carrier_id',
			allowNull: true,
		},
		'clockedIn': {
			type: DataTypes.BOOLEAN,
			field: 'clocked_in',
			allowNull: false,
			defaultValue: false,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'email': {
			type: DataTypes.STRING,
			field: 'email',
			allowNull: false,
		},
		'emailNotifications': {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			field: 'email_notifications',
			allowNull: true,
		},
		'enableEmailNotifications': {
			type: DataTypes.BOOLEAN,
			field: 'enable_email_notifications',
			allowNull: false,
			defaultValue: false,
		},
		'enableTextNotifications': {
			type: DataTypes.BOOLEAN,
			field: 'enable_text_notifications',
			allowNull: false,
			defaultValue: false,
		},
		'firstName': {
			type: DataTypes.STRING,
			field: 'first_name',
			allowNull: false,
		},
		'forgotPassword': {
			type: DataTypes.STRING,
			field: 'forgot_password',
			allowNull: true,
		},
		'hireDate': {
			type: DataTypes.DATEONLY,
			field: 'hire_date',
			allowNull: true,
		},
		'isFired': {
			type: DataTypes.BOOLEAN,
			field: 'is_fired',
			allowNull: false,
			defaultValue: false,
		},
		'lastActivity': {
			type: DataTypes.DATE,
			field: 'last_activity',
			allowNull: true,
		},
		'lastName': {
			type: DataTypes.STRING,
			field: 'last_name',
			allowNull: false,
		},
		'lastRaiseDate': {
			type: DataTypes.DATEONLY,
			field: 'last_raise_date',
			allowNull: true,
		},
		'lastReviewDate': {
			type: DataTypes.DATEONLY,
			field: 'last_review_date',
			allowNull: true,
		},
		'middleName': {
			type: DataTypes.STRING,
			field: 'middle_name',
			allowNull: true,
		},
		'notes': {
			type: DataTypes.STRING,
			field: 'notes',
			allowNull: true,
		},
		'password': {
			type: DataTypes.STRING,
			field: 'password',
			allowNull: false,
		},
		'payRateId': {
			type: DataTypes.UUID,
			field: 'pay_rate_id',
			allowNull: true,
		},
		'phoneNumber': {
			type: DataTypes.STRING,
			field: 'phone_number',
			allowNull: true,
		},
		'positionId': {
			type: DataTypes.UUID,
			field: 'position_id',
			allowNull: true,
		},
		'roles': {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			field: 'roles',
			allowNull: true,
		},
		'runningScore': {
			type: DataTypes.INTEGER,
			field: 'running_score',
			allowNull: false,
			defaultValue: 0,
		},
		'showOnSchedule': {
			type: DataTypes.BOOLEAN,
			field: 'show_on_schedule',
			allowNull: true,
			defaultValue: false,
		},
		'textNotifications': {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			field: 'text_notifications',
			allowNull: true,
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: true,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'userName': {
			type: DataTypes.STRING,
			field: 'user_name',
			allowNull: false,
		},
		'wage': {
			type: DataTypes.NUMERIC,
			field: 'wage',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.user.hasMany(models.attendance, {
		as: 'attendances',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.entry, {
		as: 'entrys',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.entry, {
		as: 'enteredByEntrys',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.entrySubtask, {
		as: 'enteredByEntrySubtasks',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.inventoryTransaction, {
		as: 'enteredByInventoryTransactions',
		foreignKey: {
			name: 'enteredById',
			field: 'entered_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.leaveRequest, {
		as: 'approvedDeniedByLeaveRequests',
		foreignKey: {
			name: 'approvedDeniedById',
			field: 'approved_denied_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.leaveRequest, {
		as: 'leaveRequests',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.maintenanceRequest, {
		as: 'assignedToMaintenanceRequests',
		foreignKey: {
			name: 'assignedToId',
			field: 'assigned_to_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.maintenanceRequest, {
		as: 'requestedByMaintenanceRequests',
		foreignKey: {
			name: 'requestedById',
			field: 'requested_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.schedule, {
		as: 'schedules',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.scheduleTrade, {
		as: 'tradeUserScheduleTrades',
		foreignKey: {
			name: 'tradeUserId',
			field: 'trade_user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userAvailability, {
		as: 'approvedDeniedByUserAvailabilitys',
		foreignKey: {
			name: 'approvedDeniedById',
			field: 'approved_denied_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userAvailability, {
		as: 'userAvailabilitys',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userClock, {
		as: 'userClocks',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userComment, {
		as: 'userComments',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userCommentReply, {
		as: 'userCommentReplys',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userNote, {
		as: 'userNotes',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userProgressChecklist, {
		as: 'managerUserProgressChecklists',
		foreignKey: {
			name: 'managerId',
			field: 'manager_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userProgressChecklist, {
		as: 'userProgressChecklists',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userProgressItem, {
		as: 'completedByUserProgressItems',
		foreignKey: {
			name: 'completedById',
			field: 'completed_by_id'
		},
		targetKey: 'userId'
	});
	models.user.hasMany(models.userTaskQueue, {
		as: 'userTaskQueues',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.user.belongsTo(models.cellPhoneCarrier, {
		as: 'cellPhoneCarrier',
		foreignKey: {
			name: 'cellPhoneCarrierId',
			field: 'cell_phone_carrier_id'
		},
		targetKey: 'cellPhoneCarrierId'
	});
	models.user.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.user.belongsTo(models.payRate, {
		as: 'payRate',
		foreignKey: {
			name: 'payRateId',
			field: 'pay_rate_id'
		},
		targetKey: 'payRateId'
	});
	models.user.belongsTo(models.position, {
		as: 'position',
		foreignKey: {
			name: 'positionId',
			field: 'position_id'
		},
		targetKey: 'positionId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};