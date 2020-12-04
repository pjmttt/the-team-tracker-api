'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('schedule', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'day_of_week': {
				type: Sequelize.INTEGER,
				field: 'day_of_week',
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
				allowNull: false,
			},
			'notes': {
				type: Sequelize.STRING(1000),
				field: 'notes',
				allowNull: true,
			},
			'published': {
				type: Sequelize.BOOLEAN,
				field: 'published',
				allowNull: false,
				defaultValue: false,
			},
			'schedule_date': {
				type: Sequelize.DATEONLY,
				field: 'schedule_date',
				allowNull: true,
			},
			'schedule_id': {
				type: Sequelize.UUID,
				field: 'schedule_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'schedule_template_id': {
				type: Sequelize.UUID,
				field: 'schedule_template_id',
				allowNull: true,
			},
			'shift_id': {
				type: Sequelize.UUID,
				field: 'shift_id',
				allowNull: false,
			},
			'start_time': {
				type: Sequelize.DATE,
				field: 'start_time',
				allowNull: false,
			},
			'task_id': {
				type: Sequelize.UUID,
				field: 'task_id',
				allowNull: false,
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
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('schedule', ['schedule_id'], {
			type: 'primary key',
			name: 'PK_schedule_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('schedule');
	}
};
			