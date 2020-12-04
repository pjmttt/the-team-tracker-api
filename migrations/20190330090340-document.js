'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('document', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			'document_id': {
				type: Sequelize.UUID,
				field: 'document_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'document_name': {
				type: Sequelize.STRING(255),
				field: 'document_name',
				allowNull: false,
			},
			'mime_type': {
				type: Sequelize.STRING(255),
				field: 'mime_type',
				allowNull: true,
			},
			'positions': {
				type: Sequelize.ARRAY(Sequelize.UUID),
				field: 'positions',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			'updated_by': {
				type: Sequelize.STRING(255),
				field: 'updated_by',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('document', ['document_id'], {
			type: 'primary key',
			name: 'PK_document_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('document');
	}
};
			