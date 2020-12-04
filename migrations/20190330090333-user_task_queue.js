'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_task_queue', {
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
			'entry_ids': {
				type: Sequelize.ARRAY(Sequelize.UUID),
				field: 'entry_ids',
				allowNull: false,
			},
			'task_id': {
				type: Sequelize.UUID,
				field: 'task_id',
				allowNull: false,
			},
			'updated_at': {
				type: Sequelize.DATE,
				field: 'updated_at',
				allowNull: false,
			},
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
			'user_task_queue_id': {
				type: Sequelize.UUID,
				field: 'user_task_queue_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_task_queue', ['user_task_queue_id'], {
			type: 'primary key',
			name: 'PK_user_task_queue_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_task_queue');
	}
};
			