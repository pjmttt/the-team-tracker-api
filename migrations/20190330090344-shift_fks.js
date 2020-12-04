'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('shift', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_shift_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('shift', 'FK_shift_company');
	}
}