'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('maintenance_request_image', ['maintenance_request_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_maintenance_request_image_maintenance_request',
			references: {
				table: 'maintenance_request',
				field: 'maintenance_request_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('maintenance_request_image', 'FK_maintenance_request_image_maintenance_request');
	}
}