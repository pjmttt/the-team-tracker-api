'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('shift', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: true,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'end_time': {
				type: Sequelize.DATE,
				field: 'end_time',
				allowNull: true,
			},
			'lunch_duration': {
				type: Sequelize.REAL,
				field: 'lunch_duration',
				allowNull: false,
				defaultValue: 0,
			},
			'shift_id': {
				type: Sequelize.UUID,
				field: 'shift_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'shift_name': {
				type: Sequelize.STRING(255),
				field: 'shift_name',
				allowNull: false,
			},
			'start_time': {
				type: Sequelize.DATE,
				field: 'start_time',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: true,
			},
			'updated_by': {
				type: Sequelize.STRING(255),
				field: 'updated_by',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('shift', ['shift_id'], {
			type: 'primary key',
			name: 'PK_shift_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('shift');
	}
};
			