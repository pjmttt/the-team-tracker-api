require('dotenv').config({ envPath: '../.env' });
const moment = require('moment-timezone');
const tables = require('../models/tables.json');
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: 'theteamtracker',
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

function getColumnType(type, udt, maxLength) {
	switch (type) {
		case 'character varying':
			return `STRING${maxLength ? `(${maxLength})` : ''}`;
		case 'timestamp with time zone':
		case 'timestamp without time zone':
			return 'DATE';
		case 'money':
			return 'FLOAT';
		case 'date':
			return 'DATEONLY';
		case 'bytea':
			return 'BLOB';
		case 'ARRAY':
			if (udt.indexOf('int') >= 0) {
				return 'ARRAY(Sequelize.INTEGER)';
			}
			else if (udt.indexOf('uuid') >= 0) {
				return 'ARRAY(Sequelize.UUID)';
			}
			else if (udt.indexOf('varchar') >= 0) {
				return 'ARRAY(Sequelize.STRING)';
			}
			throw udt;
	}
	return type.toUpperCase();
}
function translateDefaultValue(def) {
	if (!def) return null;
	switch (def) {
		case 'uuid_generate_v4()':
			return `Sequelize.literal('uuid_generate_v4()')`;
		case 'now()':
			return 'Sequelize.NOW';
	}
	const ind = def.indexOf('::');
	if (ind > 0) {
		def = def.substring(0, ind);
	}
	if (def.indexOf('ARRAY[') == 0)
		return def.substring(5);
	return def;
}
function getReference(c, t, children) {
	const ch = children.find(p => p.child_key == c.column_name && p.child_table == t);
	if (ch) {
		return {
			model: ch.parent_table,
			key: ch.parent_key
		}
	}
	return null;
}
function getColumnObject(c, t, children) {
	// refine id check
	const def = translateDefaultValue(c.column_default);
	const ref = getReference(c, t, children);
	return `
			'${c.column_name}': {
				type: Sequelize.${getColumnType(c.data_type, c.udt_name, c.character_maximum_length)},
				field: '${c.column_name}',
				allowNull: ${c.is_nullable == 'YES'},${def ? `
				defaultValue: ${def},` : ''}
			}`;
}
client.connect();
client.query(`select column_name, table_name, data_type, is_nullable, column_default, udt_name, character_maximum_length
	from INFORMATION_SCHEMA.COLUMNS
	where table_schema = 'public'
	order by table_name, column_name`, (err, dbtables) => {
		client.query(`SELECT 
				FK.TABLE_NAME as child_table,
				CU.COLUMN_NAME as child_key,
				PK.TABLE_NAME as parent_table,
				PT.COLUMN_NAME as parent_key,
				C.CONSTRAINT_NAME
				FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS C
				INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS FK ON C.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
				INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK ON C.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
				INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE CU ON C.CONSTRAINT_NAME = CU.CONSTRAINT_NAME
				INNER JOIN (
				SELECT i1.TABLE_NAME, i2.COLUMN_NAME
				FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS i1
				INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE i2 ON i1.CONSTRAINT_NAME = i2.CONSTRAINT_NAME
				WHERE i1.CONSTRAINT_TYPE = 'PRIMARY KEY'
				) PT ON PT.TABLE_NAME = PK.TABLE_NAME`, (err2, dbfks) => {
				client.end();
				let ind = 0;
				for (let table of tables) {
					let migrationScript = `'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
`;
					migrationScript += `		await queryInterface.createTable('${table}', {`;
					let cols = dbtables.rows.filter(r => r.table_name == table);
					for (const c of cols) {
						migrationScript += `${getColumnObject(c, table, dbfks.rows.filter(f => f.child_table == table))},`;
					}
					migrationScript += `
		});
`;
		migrationScript += `		await queryInterface.addConstraint('${table}', ['${table}_id'], {
			type: 'primary key',
			name: 'PK_${table}_id'
		});
	},
	
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('${table}');
	}
};
			`;

					fs.writeFileSync(`migrations/${moment().format("YYYYMMDDHHmm" + ind.toString().padStart(2, '0'))}-${table}.js`, migrationScript);
					ind++;
				}

				for (let table of tables) {
					const parents = dbfks.rows.filter(f => f.child_table == table);
					if (parents.length) {
						let migrationScript = `'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
`;
						for (let p of parents) {
							migrationScript += `		await queryInterface.addConstraint('${p.child_table}', ['${p.child_key}'], {
			type: 'FOREIGN KEY',
			name: 'FK_${p.child_table}_${p.child_key.substring(0, p.child_key.length - 3)}',
			references: {
				table: '${p.parent_table}',
				field: '${p.parent_key}',
			},
		});
`;
						}
						migrationScript += `
	},
	down: async (queryInterface, Sequelize) => {`;
						for (let p of parents) {
							migrationScript += `
			await queryInterface.removeConstraint('${p.child_table}', 'FK_${p.child_table}_${p.child_key.substring(0, p.child_key.length - 3)}');`;
						}
						migrationScript += `
	}
}`;
						fs.writeFileSync(`migrations/${moment().format("YYYYMMDDHHmm" + ind.toString().padStart(2, '0'))}-${table}_fks.js`, migrationScript);
						ind++;
					}

				}
			});
	});
