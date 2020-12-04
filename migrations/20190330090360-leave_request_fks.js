'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('leave_request', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_leave_request_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('leave_request', ['approved_denied_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_leave_request_approved_denied_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('leave_request', 'FK_leave_request_user');
			await queryInterface.removeConstraint('leave_request', 'FK_leave_request_approved_denied_by');
	}
}