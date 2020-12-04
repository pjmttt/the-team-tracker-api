'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('position', {
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
			'position_id': {
				type: Sequelize.UUID,
				field: 'position_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'position_name': {
				type: Sequelize.STRING(255),
				field: 'position_name',
				allowNull: false,
			},
			'text_color': {
				type: Sequelize.STRING(10),
				field: 'text_color',
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
		await queryInterface.addConstraint('position', ['position_id'], {
			type: 'primary key',
			name: 'PK_position_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('position');
	}
};
			