'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_clock', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_clock_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_clock', 'FK_user_clock_user');
	}
}