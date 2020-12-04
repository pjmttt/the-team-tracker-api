'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('status', {
			'abbreviation': {
				type: Sequelize.STRING(10),
				field: 'abbreviation',
				allowNull: false,
			},
			'background_color': {
				type: Sequelize.STRING(50),
				field: 'background_color',
				allowNull: true,
			},
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
				allowNull: false,
			},
			'created_at': {
				type: Sequelize.DATE,
				field: 'created_at',
				allowNull: true,
			},
			'deleted_at': {
				type: Sequelize.DATE,
				field: 'deleted_at',
				allowNull: true,
			},
			'manager_email_template_id': {
				type: Sequelize.UUID,
				field: 'manager_email_template_id',
				allowNull: true,
			},
			'notify_manager_after': {
				type: Sequelize.INTEGER,
				field: 'notify_manager_after',
				allowNull: true,
			},
			'status_id': {
				type: Sequelize.UUID,
				field: 'status_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'status_name': {
				type: Sequelize.STRING(255),
				field: 'status_name',
				allowNull: false,
			},
			'text_color': {
				type: Sequelize.STRING(50),
				field: 'text_color',
				allowNull: true,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: true,
			},
			'updated_by': {
				type: Sequelize.STRING(255),
				field: 'updated_by',
				allowNull: true,
			},
		});
		await queryInterface.addConstraint('status', ['status_id'], {
			type: 'primary key',
			name: 'PK_status_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('status');
	}
};
			