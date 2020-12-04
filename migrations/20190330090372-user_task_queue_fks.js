'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_task_queue', ['task_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_task_queue_task',
			references: {
				table: 'task',
				field: 'task_id',
			},
		});
		await queryInterface.addConstraint('user_task_queue', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_task_queue_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_task_queue', 'FK_user_task_queue_task');
			await queryInterface.removeConstraint('user_task_queue', 'FK_user_task_queue_user');
	}
}