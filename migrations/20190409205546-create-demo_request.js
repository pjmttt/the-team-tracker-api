'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('demo_request', {
			'demoRequestId': {
				type: Sequelize.UUID,
				field: 'demo_request_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'firstName': {
				type: Sequelize.STRING(255),
				field: 'first_name',
				allowNull: false,
			},
			'lastName': {
				type: Sequelize.STRING(255),
				field: 'last_name',
				allowNull: false,
			},
			'companyName': {
				type: Sequelize.STRING(255),
				field: 'company_name',
				allowNull: false,
			},
			'email': {
				type: Sequelize.STRING(255),
				field: 'email',
				allowNull: false,
			},
			'phoneNumber': {
				type: Sequelize.STRING(255),
				field: 'phone_number',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('demo_request', ['demo_request_id'], {
			type: 'primary key',
			name: 'PK_demo_request_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('demo_request');
	}
};
			