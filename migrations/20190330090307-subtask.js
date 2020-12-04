'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('subtask', {
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
			'sequence': {
				type: Sequelize.INTEGER,
				field: 'sequence',
				allowNull: false,
				defaultValue: 0,
			},
			'subtask_id': {
				type: Sequelize.UUID,
				field: 'subtask_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'subtask_name': {
				type: Sequelize.STRING(255),
				field: 'subtask_name',
				allowNull: false,
			},
			'task_id': {
				type: Sequelize.UUID,
				field: 'task_id',
				allowNull: true,
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
		await queryInterface.addConstraint('subtask', ['subtask_id'], {
			type: 'primary key',
			name: 'PK_subtask_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('subtask');
	}
};
			