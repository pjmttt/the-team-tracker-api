'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('progress_item', ['progress_checklist_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_progress_item_progress_checklist',
			references: {
				table: 'progress_checklist',
				field: 'progress_checklist_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('progress_item', 'FK_progress_item_progress_checklist');
	}
}