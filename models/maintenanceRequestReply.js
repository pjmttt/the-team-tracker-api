// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('maintenance_request_reply', {
		'maintenanceRequestId': {
			type: DataTypes.UUID,
			field: 'maintenance_request_id',
			allowNull: false,
		},
		'maintenanceRequestReplyId': {
			type: DataTypes.UUID,
			field: 'maintenance_request_reply_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'replyDate': {
			type: DataTypes.DATEONLY,
			field: 'reply_date',
			allowNull: false,
		},
		'replyText': {
			type: DataTypes.STRING,
			field: 'reply_text',
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
	models.maintenanceRequestReply.belongsTo(models.maintenanceRequest, {
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