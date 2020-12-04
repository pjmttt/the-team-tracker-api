'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('progress_checklist', {
			'checklist_name': {
				type: Sequelize.STRING(255),
				field: 'checklist_name',
				allowNull: false,
			},
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
			'progress_checklist_id': {
				type: Sequelize.UUID,
				field: 'progress_checklist_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
		await queryInterface.addConstraint('progress_checklist', ['progress_checklist_id'], {
			type: 'primary key',
			name: 'PK_progress_checklist_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('progress_checklist');
	}
};
			