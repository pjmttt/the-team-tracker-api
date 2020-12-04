'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('email_queue_attachment', ['email_queue_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_email_queue_attachment_email_queue',
			references: {
				table: 'email_queue',
				field: 'email_queue_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('email_queue_attachment', 'FK_email_queue_attachment_email_queue');
	}
}