'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('pay_rate', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_pay_rate_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('pay_rate', 'FK_pay_rate_company');
	}
}