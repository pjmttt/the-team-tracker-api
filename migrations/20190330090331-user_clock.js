'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_clock', {
			'clock_in_date': {
				type: Sequelize.DATE,
				field: 'clock_in_date',
				allowNull: false,
			},
			'clock_out_date': {
				type: Sequelize.DATE,
				field: 'clock_out_date',
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
			'notes': {
				type: Sequelize.STRING(255),
				field: 'notes',
				allowNull: true,
			},
			'status': {
				type: Sequelize.INTEGER,
				field: 'status',
				allowNull: true,
				defaultValue: 0,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'user_clock_id': {
				type: Sequelize.UUID,
				field: 'user_clock_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('user_clock', ['user_clock_id'], {
			type: 'primary key',
			name: 'PK_user_clock_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_clock');
	}
};
			