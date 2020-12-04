'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('contact_us', {
			'contact_us_id': {
				type: Sequelize.UUID,
				field: 'contact_us_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
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
			'message': {
				type: Sequelize.STRING,
				field: 'message',
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
		});
		await queryInterface.addConstraint('contact_us', ['contact_us_id'], {
			type: 'primary key',
			name: 'PK_contact_us_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('contact_us');
	}
};
			