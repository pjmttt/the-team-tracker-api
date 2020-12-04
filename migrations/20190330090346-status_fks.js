'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('status', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_status_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('status', ['manager_email_template_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_status_manager_email_template',
			references: {
				table: 'email_template',
				field: 'email_template_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('status', 'FK_status_company');
			await queryInterface.removeConstraint('status', 'FK_status_manager_email_template');
	}
}