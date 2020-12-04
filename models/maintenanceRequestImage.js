// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('maintenance_request_image', {
		'imageType': {
			type: DataTypes.STRING,
			field: 'image_type',
			allowNull: false,
		},
		'maintenanceRequestId': {
			type: DataTypes.UUID,
			field: 'maintenance_request_id',
			allowNull: false,
		},
		'maintenanceRequestImageId': {
			type: DataTypes.UUID,
			field: 'maintenance_request_image_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
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
	models.maintenanceRequestImage.belongsTo(models.maintenanceRequest, {
		as: 'maintenanceRequest',
		foreignKey: {
			name: 'maintenanceRequestId',
			field: 'maintenance_request_id'
		},
		targetKey: 'maintenanceRequestId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};