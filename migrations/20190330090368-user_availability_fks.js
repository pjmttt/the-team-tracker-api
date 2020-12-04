'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_availability', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_availability_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('user_availability', ['approved_denied_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_availability_approved_denied_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_availability', 'FK_user_availability_user');
			await queryInterface.removeConstraint('user_availability', 'FK_user_availability_approved_denied_by');
	}
}