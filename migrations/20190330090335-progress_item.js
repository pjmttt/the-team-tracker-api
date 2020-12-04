'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('progress_item', {
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
			'item_description': {
				type: Sequelize.STRING,
				field: 'item_description',
				allowNull: false,
			},
			'progress_checklist_id': {
				type: Sequelize.UUID,
				field: 'progress_checklist_id',
				allowNull: false,
			},
			'progress_item_id': {
				type: Sequelize.UUID,
				field: 'progress_item_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'sequence': {
				type: Sequelize.INTEGER,
				field: 'sequence',
				allowNull: false,
				defaultValue: 0,
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
		await queryInterface.addConstraint('progress_item', ['progress_item_id'], {
			type: 'primary key',
			name: 'PK_progress_item_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('progress_item');
	}
};
			