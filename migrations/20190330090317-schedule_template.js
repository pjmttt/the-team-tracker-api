'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('schedule_template', {
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
			'schedule_template_id': {
				type: Sequelize.UUID,
				field: 'schedule_template_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'template_name': {
				type: Sequelize.STRING,
				field: 'template_name',
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
		await queryInterface.addConstraint('schedule_template', ['schedule_template_id'], {
			type: 'primary key',
			name: 'PK_schedule_template_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('schedule_template');
	}
};
			