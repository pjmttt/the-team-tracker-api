'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('maintenance_request_reply', ['maintenance_request_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_maintenance_request_reply_maintenance_request',
			references: {
				table: 'maintenance_request',
				field: 'maintenance_request_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('maintenance_request_reply', 'FK_maintenance_request_reply_maintenance_request');
	}
}