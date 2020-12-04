'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('task', {
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
			'difficulty': {
				type: Sequelize.INTEGER,
				field: 'difficulty',
				allowNull: true,
			},
			'notify_after': {
				type: Sequelize.INTEGER,
				field: 'notify_after',
				allowNull: false,
				defaultValue: 0,
			},
			'task_id': {
				type: Sequelize.UUID,
				field: 'task_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'task_name': {
				type: Sequelize.STRING(255),
				field: 'task_name',
				allowNull: false,
			},
			'task_type': {
				type: Sequelize.INTEGER,
				field: 'task_type',
				allowNull: true,
				defaultValue: 0,
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
		await queryInterface.addConstraint('task', ['task_id'], {
			type: 'primary key',
			name: 'PK_task_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('task');
	}
};
			