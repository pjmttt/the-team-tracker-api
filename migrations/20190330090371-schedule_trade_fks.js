'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('schedule_trade', ['trade_user_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_trade_trade_user',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('schedule_trade', ['schedule_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_trade_schedule',
			references: {
				table: 'schedule',
				field: 'schedule_id',
			},
		});
		await queryInterface.addConstraint('schedule_trade', ['trade_for_schedule_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_schedule_trade_trade_for_schedule',
			references: {
				table: 'schedule',
				field: 'schedule_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('schedule_trade', 'FK_schedule_trade_trade_user');
			await queryInterface.removeConstraint('schedule_trade', 'FK_schedule_trade_schedule');
			await queryInterface.removeConstraint('schedule_trade', 'FK_schedule_trade_trade_for_schedule');
	}
}