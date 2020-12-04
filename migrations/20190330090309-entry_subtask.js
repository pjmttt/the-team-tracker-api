'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('entry_subtask', {
			'addressed': {
				type: Sequelize.BOOLEAN,
				field: 'addressed',
				allowNull: false,
				defaultValue: false,
			},
			'comments': {
				type: Sequelize.STRING,
				field: 'comments',
				allowNull: true,
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
			'entered_by_id': {
				type: Sequelize.UUID,
				field: 'entered_by_id',
				allowNull: true,
			},
			'entry_id': {
				type: Sequelize.UUID,
				field: 'entry_id',
				allowNull: false,
			},
			'entry_subtask_id': {
				type: Sequelize.UUID,
				field: 'entry_subtask_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'status_id': {
				type: Sequelize.UUID,
				field: 'status_id',
				allowNull: true,
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
		});
		await queryInterface.addConstraint('entry_subtask', ['entry_subtask_id'], {
			type: 'primary key',
			name: 'PK_entry_subtask_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('entry_subtask');
	}
};
			