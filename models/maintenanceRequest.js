// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('maintenance_request', {
		'assignedToId': {
			type: DataTypes.UUID,
			field: 'assigned_to_id',
			allowNull: true,
		},
		'comments': {
			type: DataTypes.STRING,
			field: 'comments',
			allowNull: true,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'isAddressed': {
			type: DataTypes.BOOLEAN,
			field: 'is_addressed',
			allowNull: false,
			defaultValue: false,
		},
		'maintenanceRequestId': {
			type: DataTypes.UUID,
			field: 'maintenance_request_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'requestDate': {
			type: DataTypes.DATEONLY,
			field: 'request_date',
			allowNull: false,
		},
		'requestDescription': {
			type: DataTypes.STRING,
			field: 'request_description',
			allowNull: false,
		},
		'requestedById': {
			type: DataTypes.UUID,
			field: 'requested_by_id',
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
	models.maintenanceRequest.hasMany(models.maintenanceRequestImage, {
		as: 'maintenanceRequestImages',
		foreignKey: {
			name: 'maintenanceRequestId',
			field: 'maintenance_request_id'
		},
		targetKey: 'maintenanceRequestId'
	});
	models.maintenanceRequest.hasMany(models.maintenanceRequestReply, {
		as: 'maintenanceRequestReplys',
		foreignKey: {
			name: 'maintenanceRequestId',
			field: 'maintenance_request_id'
		},
		targetKey: 'maintenanceRequestId'
	});
	models.maintenanceRequest.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.maintenanceRequest.belongsTo(models.user, {
		as: 'requestedBy',
		foreignKey: {
			name: 'requestedById',
			field: 'requested_by_id'
		},
		targetKey: 'userId'
	});
	models.maintenanceRequest.belongsTo(models.user, {
		as: 'assignedTo',
		foreignKey: {
			name: 'assignedToId',
			field: 'assigned_to_id'
		},
		targetKey: 'userId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};