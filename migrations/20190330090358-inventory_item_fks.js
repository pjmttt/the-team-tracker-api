'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('inventory_item', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_item_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('inventory_item', ['inventory_category_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_item_inventory_category',
			references: {
				table: 'inventory_category',
				field: 'inventory_category_id',
			},
		});
		await queryInterface.addConstraint('inventory_item', ['vendor_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_item_vendor',
			references: {
				table: 'vendor',
				field: 'vendor_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('inventory_item', 'FK_inventory_item_company');
			await queryInterface.removeConstraint('inventory_item', 'FK_inventory_item_inventory_category');
			await queryInterface.removeConstraint('inventory_item', 'FK_inventory_item_vendor');
	}
}