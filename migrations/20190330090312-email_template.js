'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('email_template', {
			'body': {
				type: Sequelize.TEXT,
				field: 'body',
				allowNull: false,
			},
			'body_text': {
				type: Sequelize.TEXT,
				field: 'body_text',
				allowNull: true,
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
			'email_template_id': {
				type: Sequelize.UUID,
				field: 'email_template_id',
				allowNull: false,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
			},
			'subject': {
				type: Sequelize.STRING(1000),
				field: 'subject',
				allowNull: false,
			},
			'template_type': {
				type: Sequelize.INTEGER,
				field: 'template_type',
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
		await queryInterface.addConstraint('email_template', ['email_template_id'], {
			type: 'primary key',
			name: 'PK_email_template_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('email_template');
	}
};
			