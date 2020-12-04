'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('schedule', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('schedule', ['shift_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_shift',
			references: {
				table: 'shift',
				field: 'shift_id',
			},
		});
		await queryInterface.addConstraint('schedule', ['task_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_task',
			references: {
				table: 'task',
				field: 'task_id',
			},
		});
		await queryInterface.addConstraint('schedule', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('schedule', ['schedule_template_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_schedule_template',
			references: {
				table: 'schedule_template',
				field: 'schedule_template_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('schedule', 'FK_schedule_company');
			await queryInterface.removeConstraint('schedule', 'FK_schedule_shift');
			await queryInterface.removeConstraint('schedule', 'FK_schedule_task');
			await queryInterface.removeConstraint('schedule', 'FK_schedule_user');
			await queryInterface.removeConstraint('schedule', 'FK_schedule_schedule_template');
	}
}