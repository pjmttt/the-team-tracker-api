// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('email_queue_attachment', {
		'attachment': {
			type: DataTypes.BLOB,
			field: 'attachment',
			allowNull: false,
		},
		'attachmentName': {
			type: DataTypes.STRING,
			field: 'attachment_name',
			allowNull: true,
		},
		'attachmentType': {
			type: DataTypes.STRING,
			field: 'attachment_type',
			allowNull: false,
		},
		'emailQueueAttachmentId': {
			type: DataTypes.UUID,
			field: 'email_queue_attachment_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'emailQueueId': {
			type: DataTypes.UUID,
			field: 'email_queue_id',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(true, false));
}
function createAssociations(models) {
	models.emailQueueAttachment.belongsTo(models.emailQueue, {
		as: 'emailQueue',
		foreignKey: {
			name: 'emailQueueId',
			field: 'email_queue_id'
		},
		targetKey: 'emailQueueId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};