'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user', {
			'cell_phone_carrier_id': {
				type: Sequelize.UUID,
				field: 'cell_phone_carrier_id',
				allowNull: true,
			},
			'clocked_in': {
				type: Sequelize.BOOLEAN,
				field: 'clocked_in',
				allowNull: false,
				defaultValue: false,
			},
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
			'email': {
				type: Sequelize.STRING(255),
				field: 'email',
				allowNull: false,
			},
			'email_notifications': {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				field: 'email_notifications',
				allowNull: true,
				defaultValue: [0],
			},
			'enable_email_notifications': {
				type: Sequelize.BOOLEAN,
				field: 'enable_email_notifications',
				allowNull: false,
				defaultValue: false,
			},
			'enable_text_notifications': {
				type: Sequelize.BOOLEAN,
				field: 'enable_text_notifications',
				allowNull: false,
				defaultValue: false,
			},
			'first_name': {
				type: Sequelize.STRING(50),
				field: 'first_name',
				allowNull: false,
			},
			'forgot_password': {
				type: Sequelize.STRING(50),
				field: 'forgot_password',
				allowNull: true,
			},
			'hire_date': {
				type: Sequelize.DATEONLY,
				field: 'hire_date',
				allowNull: true,
			},
			'is_fired': {
				type: Sequelize.BOOLEAN,
				field: 'is_fired',
				allowNull: false,
				defaultValue: false,
			},
			'last_activity': {
				type: Sequelize.DATE,
				field: 'last_activity',
				allowNull: true,
			},
			'last_name': {
				type: Sequelize.STRING(50),
				field: 'last_name',
				allowNull: false,
			},
			'last_raise_date': {
				type: Sequelize.DATEONLY,
				field: 'last_raise_date',
				allowNull: true,
			},
			'last_review_date': {
				type: Sequelize.DATEONLY,
				field: 'last_review_date',
				allowNull: true,
			},
			'middle_name': {
				type: Sequelize.STRING,
				field: 'middle_name',
				allowNull: true,
			},
			'notes': {
				type: Sequelize.STRING(1000),
				field: 'notes',
				allowNull: true,
			},
			'password': {
				type: Sequelize.STRING(1000),
				field: 'password',
				allowNull: false,
			},
			'pay_rate_id': {
				type: Sequelize.UUID,
				field: 'pay_rate_id',
				allowNull: true,
			},
			'phone_number': {
				type: Sequelize.STRING(50),
				field: 'phone_number',
				allowNull: true,
			},
			'position_id': {
				type: Sequelize.UUID,
				field: 'position_id',
				allowNull: true,
			},
			'roles': {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				field: 'roles',
				allowNull: true,
				defaultValue: [0],
			},
			'running_score': {
				type: Sequelize.INTEGER,
				field: 'running_score',
				allowNull: false,
				defaultValue: 0,
			},
			'show_on_schedule': {
				type: Sequelize.BOOLEAN,
				field: 'show_on_schedule',
				allowNull: true,
				defaultValue: false,
			},
			'text_notifications': {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				field: 'text_notifications',
				allowNull: true,
				defaultValue: [0],
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
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'user_name': {
				type: Sequelize.STRING(50),
				field: 'user_name',
				allowNull: false,
			},
			'wage': {
				type: Sequelize.NUMERIC,
				field: 'wage',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('user', ['user_id'], {
			type: 'primary key',
			name: 'PK_user_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user');
	}
};
			