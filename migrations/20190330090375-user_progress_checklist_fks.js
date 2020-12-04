'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_progress_checklist', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_checklist_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('user_progress_checklist', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_checklist_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('user_progress_checklist', ['manager_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_checklist_manager',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('user_progress_checklist', ['progress_checklist_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_checklist_progress_checklist',
			references: {
				table: 'progress_checklist',
				field: 'progress_checklist_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_progress_checklist', 'FK_user_progress_checklist_company');
			await queryInterface.removeConstraint('user_progress_checklist', 'FK_user_progress_checklist_user');
			await queryInterface.removeConstraint('user_progress_checklist', 'FK_user_progress_checklist_manager');
			await queryInterface.removeConstraint('user_progress_checklist', 'FK_user_progress_checklist_progress_checklist');
	}
}