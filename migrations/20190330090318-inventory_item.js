'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('inventory_item', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'cost_on_hand': {
				type: Sequelize.NUMERIC,
				field: 'cost_on_hand',
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
				type: Sequelize.DATEONLY,
				field: 'expiration_date',
				allowNull: true,
			},
			'inventory_category_id': {
				type: Sequelize.UUID,
				field: 'inventory_category_id',
				allowNull: false,
			},
			'inventory_item_id': {
				type: Sequelize.UUID,
				field: 'inventory_item_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'inventory_item_name': {
				type: Sequelize.STRING,
				field: 'inventory_item_name',
				allowNull: false,
			},
			'last_updated': {
				type: Sequelize.DATE,
				field: 'last_updated',
				allowNull: true,
			},
			'minimum_quantity': {
				type: Sequelize.INTEGER,
				field: 'minimum_quantity',
				allowNull: true,
			},
			'notes': {
				type: Sequelize.STRING(255),
				field: 'notes',
				allowNull: true,
			},
			'quantity_on_hand': {
				type: Sequelize.INTEGER,
				field: 'quantity_on_hand',
				allowNull: true,
			},
			'unit_cost': {
				type: Sequelize.NUMERIC,
				field: 'unit_cost',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'vendor_id': {
				type: Sequelize.UUID,
				field: 'vendor_id',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('inventory_item', ['inventory_item_id'], {
			type: 'primary key',
			name: 'PK_inventory_item_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('inventory_item');
	}
};
			