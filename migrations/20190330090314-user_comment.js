'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_comment', {
			'comment': {
				type: Sequelize.STRING,
				field: 'comment',
				allowNull: false,
			},
			'comment_date': {
				type: Sequelize.DATE,
				field: 'comment_date',
				allowNull: false,
			},
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'send_email': {
				type: Sequelize.BOOLEAN,
				field: 'send_email',
				allowNull: false,
				defaultValue: false,
			},
			'send_text': {
				type: Sequelize.BOOLEAN,
				field: 'send_text',
				allowNull: false,
				defaultValue: false,
			},
			'subject': {
				type: Sequelize.STRING,
				field: 'subject',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'user_comment_id': {
				type: Sequelize.UUID,
				field: 'user_comment_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
			'user_ids': {
				type: Sequelize.ARRAY(Sequelize.UUID),
				field: 'user_ids',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('user_comment', ['user_comment_id'], {
			type: 'primary key',
			name: 'PK_user_comment_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_comment');
	}
};
			