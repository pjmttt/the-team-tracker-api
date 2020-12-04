'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_subtask', ['status_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_subtask_status',
			references: {
				table: 'status',
				field: 'status_id',
			},
		});
		await queryInterface.addConstraint('user_subtask', ['subtask_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_subtask_subtask',
			references: {
				table: 'subtask',
				field: 'subtask_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_subtask', 'FK_user_subtask_status');
			await queryInterface.removeConstraint('user_subtask', 'FK_user_subtask_subtask');
	}
}