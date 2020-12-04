'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('entry', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('entry', ['shift_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_shift',
			references: {
				table: 'shift',
				field: 'shift_id',
			},
		});
		await queryInterface.addConstraint('entry', ['task_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_task',
			references: {
				table: 'task',
				field: 'task_id',
			},
		});
		await queryInterface.addConstraint('entry', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('entry', ['entered_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_entry_entered_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('entry', 'FK_entry_company');
			await queryInterface.removeConstraint('entry', 'FK_entry_shift');
			await queryInterface.removeConstraint('entry', 'FK_entry_task');
			await queryInterface.removeConstraint('entry', 'FK_entry_user');
			await queryInterface.removeConstraint('entry', 'FK_entry_entered_by');
	}
}