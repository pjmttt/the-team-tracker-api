'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('cell_phone_carrier', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_cell_phone_carrier_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('cell_phone_carrier', 'FK_cell_phone_carrier_company');
	}
}