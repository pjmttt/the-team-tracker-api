'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_progress_item', {
			'comments': {
				type: Sequelize.STRING(5000),
				field: 'comments',
				allowNull: true,
			},
			'completed_by_id': {
				type: Sequelize.UUID,
				field: 'completed_by_id',
				allowNull: true,
			},
			'completed_date': {
				type: Sequelize.DATEONLY,
				field: 'completed_date',
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
			'progress_item_id': {
				type: Sequelize.UUID,
				field: 'progress_item_id',
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
			'user_progress_checklist_id': {
				type: Sequelize.UUID,
				field: 'user_progress_checklist_id',
				allowNull: false,
			},
			'user_progress_item_id': {
				type: Sequelize.UUID,
				field: 'user_progress_item_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_progress_item', ['user_progress_item_id'], {
			type: 'primary key',
			name: 'PK_user_progress_item_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_progress_item');
	}
};
			