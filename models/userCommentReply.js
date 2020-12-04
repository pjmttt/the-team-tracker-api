// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_comment_reply', {
		'replyDate': {
			type: DataTypes.DATE,
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
		'userCommentId': {
			type: DataTypes.UUID,
			field: 'user_comment_id',
			allowNull: false,
		},
		'userCommentReplyId': {
			type: DataTypes.UUID,
			field: 'user_comment_reply_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
	},
	modelhelpers.getConfig(false, false));
}
function createAssociations(models) {
	models.userCommentReply.belongsTo(models.user, {
		as: 'user',
		foreignKey: {
			name: 'userId',
			field: 'user_id'
		},
		targetKey: 'userId'
	});
	models.userCommentReply.belongsTo(models.userComment, {
		as: 'userComment',
		foreignKey: {
			name: 'userCommentId',
			field: 'user_comment_id'
		},
		targetKey: 'userCommentId'
	});
}
module.exports = {
	defineModel,
	createAssociations	
};