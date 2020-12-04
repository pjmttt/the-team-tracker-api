'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('schedule_trade', {
			'comments': {
				type: Sequelize.STRING,
				field: 'comments',
				allowNull: true,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'schedule_id': {
				type: Sequelize.UUID,
				field: 'schedule_id',
				allowNull: false,
			},
			'schedule_trade_id': {
				type: Sequelize.UUID,
				field: 'schedule_trade_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'trade_for_schedule_id': {
				type: Sequelize.UUID,
				field: 'trade_for_schedule_id',
				allowNull: true,
			},
			'trade_status': {
				type: Sequelize.INTEGER,
				field: 'trade_status',
				allowNull: false,
				defaultValue: 0,
			},
			'trade_user_id': {
				type: Sequelize.UUID,
				field: 'trade_user_id',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('schedule_trade', ['schedule_trade_id'], {
			type: 'primary key',
			name: 'PK_schedule_trade_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('schedule_trade');
	}
};
			