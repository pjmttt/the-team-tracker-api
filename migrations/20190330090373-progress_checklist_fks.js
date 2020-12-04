'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('progress_checklist', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_progress_checklist_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('progress_checklist', 'FK_progress_checklist_company');
	}
}