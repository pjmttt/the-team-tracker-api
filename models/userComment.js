// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
	return sequelize.define('user_comment', {
		'comment': {
			type: DataTypes.STRING,
			field: 'comment',
			allowNull: false,
		},
		'commentDate': {
			type: DataTypes.DATE,
			field: 'comment_date',
			allowNull: false,
		},
		'companyId': {
			type: DataTypes.UUID,
			field: 'company_id',
			allowNull: false,
		},
		'sendEmail': {
			type: DataTypes.BOOLEAN,
			field: 'send_email',
			allowNull: false,
			defaultValue: false,
		},
		'sendText': {
			type: DataTypes.BOOLEAN,
			field: 'send_text',
			allowNull: false,
			defaultValue: false,
		},
		'subject': {
			type: DataTypes.STRING,
			field: 'subject',
			allowNull: true,
		},
		'userCommentId': {
			type: DataTypes.UUID,
			field: 'user_comment_id',
			primaryKey: true,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
		},
		'userId': {
			type: DataTypes.UUID,
			field: 'user_id',
			allowNull: false,
		},
		'userIds': {
			type: DataTypes.ARRAY(DataTypes.UUID),
			field: 'user_ids',
			allowNull: true,
		},
	},
	modelhelpers.getConfig(false, true));
}
function createAssociations(models) {
	models.userComment.hasMany(models.userCommentReply, {
		as: 'userCommentReplys',
		foreignKey: {
			name: 'userCommentId',
			field: 'user_comment_id'
		},
		targetKey: 'userCommentId'
	});
	models.userComment.belongsTo(models.company, {
		as: 'company',
		foreignKey: {
			name: 'companyId',
			field: 'company_id'
		},
		targetKey: 'companyId'
	});
	models.userComment.belongsTo(models.user, {
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