'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_availability', {
			'all_day': {
				type: Sequelize.BOOLEAN,
				field: 'all_day',
				allowNull: true,
				defaultValue: false,
			},
			'approved_denied_by_id': {
				type: Sequelize.UUID,
				field: 'approved_denied_by_id',
				allowNull: true,
			},
			'approved_denied_date': {
				type: Sequelize.DATEONLY,
				field: 'approved_denied_date',
				allowNull: true,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'day_of_week': {
				type: Sequelize.INTEGER,
				field: 'day_of_week',
				allowNull: false,
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
			'marked_for_delete': {
				type: Sequelize.BOOLEAN,
				field: 'marked_for_delete',
				allowNull: false,
				defaultValue: false,
			},
			'start_time': {
				type: Sequelize.DATE,
				field: 'start_time',
				allowNull: true,
			},
			'status': {
				type: Sequelize.INTEGER,
				field: 'status',
				allowNull: false,
				defaultValue: 0,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'updated_by': {
				type: Sequelize.STRING(50),
				field: 'updated_by',
				allowNull: false,
			},
			'user_availability_id': {
				type: Sequelize.UUID,
				field: 'user_availability_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('user_availability', ['user_availability_id'], {
			type: 'primary key',
			name: 'PK_user_availability_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_availability');
	}
};
			