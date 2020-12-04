'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('maintenance_request_reply', {
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
			'maintenance_request_id': {
				type: Sequelize.UUID,
				field: 'maintenance_request_id',
				allowNull: false,
			},
			'maintenance_request_reply_id': {
				type: Sequelize.UUID,
				field: 'maintenance_request_reply_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'reply_date': {
				type: Sequelize.DATEONLY,
				field: 'reply_date',
				allowNull: false,
			},
			'reply_text': {
				type: Sequelize.STRING(1000),
				field: 'reply_text',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'updated_by': {
				type: Sequelize.STRING(50),
				field: 'updated_by',
				allowNull: false,
			},
		});
		await queryInterface.addConstraint('maintenance_request_reply', ['maintenance_request_reply_id'], {
			type: 'primary key',
			name: 'PK_maintenance_request_reply_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('maintenance_request_reply');
	}
};
			