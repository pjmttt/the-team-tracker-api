'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user_entry_queue', ['entry_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_entry_queue_entry',
			references: {
				table: 'entry',
				field: 'entry_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user_entry_queue', 'FK_user_entry_queue_entry');
	}
}