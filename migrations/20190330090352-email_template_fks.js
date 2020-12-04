'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('email_template', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_email_template_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('email_template', 'FK_email_template_company');
	}
}