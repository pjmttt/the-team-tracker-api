'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('schedule_template', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_template_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('schedule_template', 'FK_schedule_template_company');
	}
}