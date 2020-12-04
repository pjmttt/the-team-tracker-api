'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('attendance_reason', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_attendance_reason_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('attendance_reason', 'FK_attendance_reason_company');
	}
}