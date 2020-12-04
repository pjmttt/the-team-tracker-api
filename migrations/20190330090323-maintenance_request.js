'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('maintenance_request', {
			'assigned_to_id': {
				type: Sequelize.UUID,
				field: 'assigned_to_id',
				allowNull: true,
			},
			'comments': {
				type: Sequelize.STRING(1000),
				field: 'comments',
				allowNull: true,
			},
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
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'is_addressed': {
				type: Sequelize.BOOLEAN,
				field: 'is_addressed',
				allowNull: false,
				defaultValue: false,
			},
			'maintenance_request_id': {
				type: Sequelize.UUID,
				field: 'maintenance_request_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'request_date': {
				type: Sequelize.DATEONLY,
				field: 'request_date',
				allowNull: false,
			},
			'request_description': {
				type: Sequelize.STRING(1000),
				field: 'request_description',
				allowNull: false,
			},
			'requested_by_id': {
				type: Sequelize.UUID,
				field: 'requested_by_id',
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
		});
		await queryInterface.addConstraint('maintenance_request', ['maintenance_request_id'], {
			type: 'primary key',
			name: 'PK_maintenance_request_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('maintenance_request');
	}
};
			