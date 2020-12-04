'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('attendance', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_attendance_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('attendance', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_attendance_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('attendance', ['attendance_reason_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_attendance_attendance_reason',
			references: {
				table: 'attendance_reason',
				field: 'attendance_reason_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('attendance', 'FK_attendance_company');
			await queryInterface.removeConstraint('attendance', 'FK_attendance_user');
			await queryInterface.removeConstraint('attendance', 'FK_attendance_attendance_reason');
	}
}