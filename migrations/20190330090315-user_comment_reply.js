'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_comment_reply', {
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			'reply_date': {
				type: Sequelize.DATE,
				field: 'reply_date',
				allowNull: false,
			},
			'reply_text': {
				type: Sequelize.STRING(255),
				field: 'reply_text',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			'updated_by': {
				type: Sequelize.STRING(255),
				field: 'updated_by',
				allowNull: false,
			},
			'user_comment_id': {
				type: Sequelize.UUID,
				field: 'user_comment_id',
				allowNull: false,
			},
			'user_comment_reply_id': {
				type: Sequelize.UUID,
				field: 'user_comment_reply_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('user_comment_reply', ['user_comment_reply_id'], {
			type: 'primary key',
			name: 'PK_user_comment_reply_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_comment_reply');
	}
};
			