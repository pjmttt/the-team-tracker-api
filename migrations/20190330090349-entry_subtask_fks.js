'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('entry_subtask', ['entry_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_subtask_entry',
			references: {
				table: 'entry',
				field: 'entry_id',
			},
		});
		await queryInterface.addConstraint('entry_subtask', ['status_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_subtask_status',
			references: {
				table: 'status',
				field: 'status_id',
			},
		});
		await queryInterface.addConstraint('entry_subtask', ['entered_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_subtask_entered_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('entry_subtask', ['subtask_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_subtask_subtask',
			references: {
				table: 'subtask',
				field: 'subtask_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('entry_subtask', 'FK_entry_subtask_entry');
			await queryInterface.removeConstraint('entry_subtask', 'FK_entry_subtask_status');
			await queryInterface.removeConstraint('entry_subtask', 'FK_entry_subtask_entered_by');
			await queryInterface.removeConstraint('entry_subtask', 'FK_entry_subtask_subtask');
	}
}