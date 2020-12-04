'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('vendor', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_vendor_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('vendor', 'FK_vendor_company');
	}
}