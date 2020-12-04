'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('inventory_transaction', {
			'comments': {
				type: Sequelize.STRING(1000),
				field: 'comments',
				allowNull: true,
			},
			'cost_per': {
				type: Sequelize.NUMERIC,
				field: 'cost_per',
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
			'entered_by_id': {
				type: Sequelize.UUID,
				field: 'entered_by_id',
				allowNull: true,
			},
			'inventory_item_id': {
				type: Sequelize.UUID,
				field: 'inventory_item_id',
				allowNull: false,
			},
			'inventory_transaction_id': {
				type: Sequelize.UUID,
				field: 'inventory_transaction_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'quantity': {
				type: Sequelize.INTEGER,
				field: 'quantity',
				allowNull: false,
			},
			'quantity_remaining': {
				type: Sequelize.NUMERIC,
				field: 'quantity_remaining',
				allowNull: false,
				defaultValue: 0,
			},
			'transaction_date': {
				type: Sequelize.DATE,
				field: 'transaction_date',
				allowNull: false,
			},
			'transaction_type': {
				type: Sequelize.INTEGER,
				field: 'transaction_type',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'updated_by': {
				type: Sequelize.STRING,
				field: 'updated_by',
				allowNull: false,
			},
			'vendor_id': {
				type: Sequelize.UUID,
				field: 'vendor_id',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('inventory_transaction', ['inventory_transaction_id'], {
			type: 'primary key',
			name: 'PK_inventory_transaction_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('inventory_transaction');
	}
};
			