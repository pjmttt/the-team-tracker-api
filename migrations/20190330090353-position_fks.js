'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('position', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_position_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('position', 'FK_position_company');
	}
}