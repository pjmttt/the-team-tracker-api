'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('subtask', ['task_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_subtask_task',
			references: {
				table: 'task',
				field: 'task_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('subtask', 'FK_subtask_task');
	}
}