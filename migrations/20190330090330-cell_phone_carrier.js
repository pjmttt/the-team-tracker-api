'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('cell_phone_carrier', {
			'carrier_name': {
				type: Sequelize.STRING(50),
				field: 'carrier_name',
				allowNull: false,
			},
			'cell_phone_carrier_id': {
				type: Sequelize.UUID,
				field: 'cell_phone_carrier_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
			'domain': {
				type: Sequelize.STRING(50),
				field: 'domain',
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
		await queryInterface.addConstraint('cell_phone_carrier', ['cell_phone_carrier_id'], {
			type: 'primary key',
			name: 'PK_cell_phone_carrier_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('cell_phone_carrier');
	}
};
			