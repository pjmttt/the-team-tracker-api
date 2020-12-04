'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_progress_item', ['completed_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_item_completed_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('user_progress_item', ['progress_item_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_item_progress_item',
			references: {
				table: 'progress_item',
				field: 'progress_item_id',
			},
		});
		await queryInterface.addConstraint('user_progress_item', ['user_progress_checklist_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_progress_item_user_progress_checklist',
			references: {
				table: 'user_progress_checklist',
				field: 'user_progress_checklist_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_progress_item', 'FK_user_progress_item_completed_by');
			await queryInterface.removeConstraint('user_progress_item', 'FK_user_progress_item_progress_item');
			await queryInterface.removeConstraint('user_progress_item', 'FK_user_progress_item_user_progress_checklist');
	}
}