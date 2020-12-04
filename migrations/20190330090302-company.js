'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('company', {
			'city': {
				type: Sequelize.STRING(255),
				field: 'city',
				allowNull: true,
			},
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'company_name': {
				type: Sequelize.STRING(255),
				field: 'company_name',
				allowNull: false,
			},
			'country': {
				type: Sequelize.STRING(255),
				field: 'country',
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
			'expiration_date': {
				type: Sequelize.DATE,
				field: 'expiration_date',
				allowNull: false,
			},
			'geo_location': {
				type: Sequelize.STRING(1000),
				field: 'geo_location',
				allowNull: true,
			},
			'ip_address': {
				type: Sequelize.STRING,
				field: 'ip_address',
				allowNull: true,
			},
			'min_clock_distance': {
				type: Sequelize.INTEGER,
				field: 'min_clock_distance',
				allowNull: true,
			},
			'minutes_before_late': {
				type: Sequelize.INTEGER,
				field: 'minutes_before_late',
				allowNull: true,
			},
			'modules': {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
				field: 'modules',
				allowNull: false,
				defaultValue: [0, 1, 2, 3],
			},
			'postal_code': {
				type: Sequelize.STRING(255),
				field: 'postal_code',
				allowNull: true,
			},
			'promo_code': {
				type: Sequelize.STRING(255),
				field: 'promo_code',
				allowNull: true,
			},
			'state_province': {
				type: Sequelize.STRING(255),
				field: 'state_province',
				allowNull: true,
			},
			'street_address_1': {
				type: Sequelize.STRING(255),
				field: 'street_address_1',
				allowNull: true,
			},
			'street_address_2': {
				type: Sequelize.STRING(255),
				field: 'street_address_2',
				allowNull: true,
			},
			'subscription_request_number': {
				type: Sequelize.UUID,
				field: 'subscription_request_number',
				allowNull: true,
			},
			'subscription_transaction_number': {
				type: Sequelize.STRING(255),
				field: 'subscription_transaction_number',
				allowNull: true,
			},
			'timezone': {
				type: Sequelize.STRING,
				field: 'timezone',
				allowNull: false,
				defaultValue: 'America/Los_Angeles',
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
			'week_start': {
				type: Sequelize.INTEGER,
				field: 'week_start',
				allowNull: false,
				defaultValue: 0,
			},
		});
		await queryInterface.addConstraint('company', ['company_id'], {
			type: 'primary key',
			name: 'PK_company_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('company');
	}
};
			