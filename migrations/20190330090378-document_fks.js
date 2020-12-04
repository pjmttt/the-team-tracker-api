'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addConstraint('document', ['company_id'], {
			type: 'FOREIGN KEY',
			name: 'FK_document_company',
			references: {
				table: 'company',
				field: 'company_id',
			},
		});

	},
	down: async (queryInterface, Sequelize) => {
			await queryInterface.removeConstraint('document', 'FK_document_company');
	}
}