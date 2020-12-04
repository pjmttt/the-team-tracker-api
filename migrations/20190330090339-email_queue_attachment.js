'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('email_queue_attachment', {
			'attachment': {
				type: Sequelize.BLOB,
				field: 'attachment',
				allowNull: false,
			},
			'attachment_name': {
				type: Sequelize.STRING(255),
				field: 'attachment_name',
				allowNull: true,
			},
			'attachment_type': {
				type: Sequelize.STRING(255),
				field: 'attachment_type',
				allowNull: false,
			},
			'email_queue_attachment_id': {
				type: Sequelize.UUID,
				field: 'email_queue_attachment_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'email_queue_id': {
				type: Sequelize.UUID,
				field: 'email_queue_id',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('email_queue_attachment', ['email_queue_attachment_id'], {
			type: 'primary key',
			name: 'PK_email_queue_attachment_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('email_queue_attachment');
	}
};
			