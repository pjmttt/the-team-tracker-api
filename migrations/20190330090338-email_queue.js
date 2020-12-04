'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('email_queue', {
			'body': {
				type: Sequelize.TEXT,
				field: 'body',
				allowNull: false,
			},
			'email_date': {
				type: Sequelize.DATE,
				field: 'email_date',
				allowNull: false,
			},
			'email_queue_id': {
				type: Sequelize.UUID,
				field: 'email_queue_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'is_text': {
				type: Sequelize.BOOLEAN,
				field: 'is_text',
				allowNull: false,
				defaultValue: false,
			},
			'parent_id': {
				type: Sequelize.UUID,
				field: 'parent_id',
				allowNull: true,
			},
			'replyTo': {
				type: Sequelize.STRING(255),
				field: 'replyTo',
				allowNull: true,
			},
			'subject': {
				type: Sequelize.STRING(255),
				field: 'subject',
				allowNull: true,
			},
			'tos': {
				type: Sequelize.ARRAY(Sequelize.STRING),
				field: 'tos',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('email_queue', ['email_queue_id'], {
			type: 'primary key',
			name: 'PK_email_queue_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('email_queue');
	}
};
			