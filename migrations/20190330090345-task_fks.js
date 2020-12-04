'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('task', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_task_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('task', 'FK_task_company');
	}
}