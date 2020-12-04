// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('email_queue', {
		'body': {
			type: DataTypes.TEXT,
			field: 'body',
			allowNull: false,
		},
		'emailDate': {
			type: DataTypes.DATE,
			field: 'email_date',
			allowNull: false,
		},
		'emailQueueId': {
			type: DataTypes.UUID,
			field: 'email_queue_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'isText': {
			type: DataTypes.BOOLEAN,
			field: 'is_text',
			allowNull: false,
			defaultValue: false,
		},
		'parentId': {
			type: DataTypes.UUID,
			field: 'parent_id',
			allowNull: true,
		},
		'replyTo': {
			type: DataTypes.STRING,
			field: 'replyTo',
			allowNull: true,
		},
		'subject': {
			type: DataTypes.STRING,
			field: 'subject',
			allowNull: true,
		},
		'tos': {
			type: DataTypes.ARRAY(DataTypes.STRING),
			field: 'tos',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(true, false));
}
function createAssociations(models) {
	models.emailQueue.hasMany(models.emailQueueAttachment, {
		as: 'emailQueueAttachments',
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