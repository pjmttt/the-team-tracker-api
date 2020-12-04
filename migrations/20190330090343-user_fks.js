'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('user', ['cell_phone_carrier_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_cell_phone_carrier',
			references: {
				table: 'cell_phone_carrier',
				field: 'cell_phone_carrier_id',
			},
		});
		await queryInterface.addConstraint('user', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});
		await queryInterface.addConstraint('user', ['position_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_position',
			references: {
				table: 'position',
				field: 'position_id',
			},
		});
		await queryInterface.addConstraint('user', ['pay_rate_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_user_pay_rate',
			references: {
				table: 'pay_rate',
				field: 'pay_rate_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('user', 'FK_user_cell_phone_carrier');
			await queryInterface.removeConstraint('user', 'FK_user_company');
			await queryInterface.removeConstraint('user', 'FK_user_position');
			await queryInterface.removeConstraint('user', 'FK_user_pay_rate');
	}
}