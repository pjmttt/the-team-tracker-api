'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('inventory_transaction', ['inventory_item_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_transaction_inventory_item',
			references: {
				table: 'inventory_item',
				field: 'inventory_item_id',
			},
		});
		await queryInterface.addConstraint('inventory_transaction', ['entered_by_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_transaction_entered_by',
			references: {
				table: 'user',
				field: 'user_id',
			},
		});
		await queryInterface.addConstraint('inventory_transaction', ['vendor_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_transaction_vendor',
			references: {
				table: 'vendor',
				field: 'vendor_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('inventory_transaction', 'FK_inventory_transaction_inventory_item');
			await queryInterface.removeConstraint('inventory_transaction', 'FK_inventory_transaction_entered_by');
			await queryInterface.removeConstraint('inventory_transaction', 'FK_inventory_transaction_vendor');
	}
}