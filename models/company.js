// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('company', {
		'city': {
			type: DataTypes.STRING,
			field: 'city',
			allowNull: true,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'companyName': {
			type: DataTypes.STRING,
			field: 'company_name',
			allowNull: false,
		},
		'country': {
			type: DataTypes.STRING,
			field: 'country',
			allowNull: true,
		},
		'expirationDate': {
			type: DataTypes.DATE,
			field: 'expiration_date',
			allowNull: false,
		},
		'geoLocation': {
			type: DataTypes.STRING,
			field: 'geo_location',
			allowNull: true,
		},
		'ipAddress': {
			type: DataTypes.STRING,
			field: 'ip_address',
			allowNull: true,
		},
		'minClockDistance': {
			type: DataTypes.INTEGER,
			field: 'min_clock_distance',
			allowNull: true,
		},
		'minutesBeforeLate': {
			type: DataTypes.INTEGER,
			field: 'minutes_before_late',
			allowNull: true,
		},
		'modules': {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			field: 'modules',
			allowNull: false,
			defaultValue: [0, 1, 2, 3],
		},
		'postalCode': {
			type: DataTypes.STRING,
			field: 'postal_code',
			allowNull: true,
		},
		'promoCode': {
			type: DataTypes.STRING,
			field: 'promo_code',
			allowNull: true,
		},
		'stateProvince': {
			type: DataTypes.STRING,
			field: 'state_province',
			allowNull: true,
		},
		'streetAddress1': {
			type: DataTypes.STRING,
			field: 'street_address_1',
			allowNull: true,
		},
		'streetAddress2': {
			type: DataTypes.STRING,
			field: 'street_address_2',
			allowNull: true,
		},
		'subscriptionRequestNumber': {
			type: DataTypes.UUID,
			field: 'subscription_request_number',
			allowNull: true,
		},
		'subscriptionTransactionNumber': {
			type: DataTypes.STRING,
			field: 'subscription_transaction_number',
			allowNull: true,
		},
		'timezone': {
			type: DataTypes.STRING,
			field: 'timezone',
			allowNull: false,
			defaultValue: 'America/Los_Angeles',
		},
		'updatedBy': {
			type: DataTypes.STRING,
			field: 'updated_by',
			allowNull: true,
		},
		'weekStart': {
			type: DataTypes.INTEGER,
			field: 'week_start',
			allowNull: false,
			defaultValue: 0,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.company.hasMany(models.attendance, {
		as: 'attendances',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.attendanceReason, {
		as: 'attendanceReasons',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.cellPhoneCarrier, {
		as: 'cellPhoneCarriers',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.document, {
		as: 'documents',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.emailTemplate, {
		as: 'emailTemplates',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.entry, {
		as: 'entrys',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.inventoryCategory, {
		as: 'inventoryCategorys',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.inventoryItem, {
		as: 'inventoryItems',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.maintenanceRequest, {
		as: 'maintenanceRequests',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.payRate, {
		as: 'payRates',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.position, {
		as: 'positions',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.progressChecklist, {
		as: 'progressChecklists',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.schedule, {
		as: 'schedules',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.scheduleTemplate, {
		as: 'scheduleTemplates',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.shift, {
		as: 'shifts',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.status, {
		as: 'statuss',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.task, {
		as: 'tasks',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.user, {
		as: 'users',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.userComment, {
		as: 'userComments',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.userProgressChecklist, {
		as: 'userProgressChecklists',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.company.hasMany(models.vendor, {
		as: 'vendors',
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