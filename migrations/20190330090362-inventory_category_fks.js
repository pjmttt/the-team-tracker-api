'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('inventory_category', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_inventory_category_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('inventory_category', 'FK_inventory_category_company');
	}
}