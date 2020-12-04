'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_note', ['user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_note_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_note', 'FK_user_note_user');
	}
}