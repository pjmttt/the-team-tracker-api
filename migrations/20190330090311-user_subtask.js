'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_subtask', {
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
			'entry_subtask_ids': {
				type: Sequelize.ARRAY(Sequelize.UUID),
				field: 'entry_subtask_ids',
				allowNull: true,
			},
			'status_id': {
				type: Sequelize.UUID,
				field: 'status_id',
				allowNull: false,
			},
			'subtask_id': {
				type: Sequelize.UUID,
				field: 'subtask_id',
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
			'user_id': {
				type: Sequelize.UUID,
				field: 'user_id',
				allowNull: false,
			},
			'user_subtask_id': {
				type: Sequelize.UUID,
				field: 'user_subtask_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_subtask', ['user_subtask_id'], {
			type: 'primary key',
			name: 'PK_user_subtask_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_subtask');
	}
};
			