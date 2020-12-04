'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('maintenance_request', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_maintenance_request_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('maintenance_request', ['requested_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_maintenance_request_requested_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('maintenance_request', ['assigned_to_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_maintenance_request_assigned_to',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('maintenance_request', 'FK_maintenance_request_company');
			await queryInterface.removeConstraint('maintenance_request', 'FK_maintenance_request_requested_by');
			await queryInterface.removeConstraint('maintenance_request', 'FK_maintenance_request_assigned_to');
	}
}