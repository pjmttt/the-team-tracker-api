'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('user_progress_checklist', {
			'company_id': {
				type: Sequelize.UUID,
				field: 'company_id',
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
			'manager_id': {
				type: Sequelize.UUID,
				field: 'manager_id',
				allowNull: false,
			},
			'progress_checklist_id': {
				type: Sequelize.UUID,
				field: 'progress_checklist_id',
				allowNull: false,
			},
			'start_date': {
				type: Sequelize.DATEONLY,
				field: 'start_date',
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
			'user_progress_checklist_id': {
				type: Sequelize.UUID,
				field: 'user_progress_checklist_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
		});
		await queryInterface.addConstraint('user_progress_checklist', ['user_progress_checklist_id'], {
			type: 'primary key',
			name: 'PK_user_progress_checklist_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_progress_checklist');
	}
};
			