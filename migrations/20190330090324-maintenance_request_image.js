'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('maintenance_request_image', {
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: false,
				defaultValue: Sequelize.NOW,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'image_type': {
				type: Sequelize.STRING(255),
				field: 'image_type',
				allowNull: false,
			},
			'maintenance_request_id': {
				type: Sequelize.UUID,
				field: 'maintenance_request_id',
				allowNull: false,
			},
			'maintenance_request_image_id': {
				type: Sequelize.UUID,
				field: 'maintenance_request_image_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
		await queryInterface.addConstraint('maintenance_request_image', ['maintenance_request_image_id'], {
			type: 'primary key',
			name: 'PK_maintenance_request_image_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('maintenance_request_image');
	}
};
			