'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('vendor', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'updated_by': {
				type: Sequelize.STRING,
				field: 'updated_by',
				allowNull: false,
			},
			'vendor_id': {
				type: Sequelize.UUID,
				field: 'vendor_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'vendor_name': {
				type: Sequelize.STRING,
				field: 'vendor_name',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('vendor', ['vendor_id'], {
			type: 'primary key',
			name: 'PK_vendor_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('vendor');
	}
};
			