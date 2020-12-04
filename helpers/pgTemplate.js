require('dotenv').config({ envPath: '../.env' });
const tables = require('../models/tables.json');
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});
function underscoreToCamelCase(str, firstUpper) {
	let replaced = str.replace(/(_.)/g, function (match) {
		return match[1].toUpperCase();
	});
	if (replaced && firstUpper) {
		replaced = replaced.slice(0, 1).toUpperCase() + replaced.slice(1);
	}
	return replaced;
}
function getColumnType(type, udt) {
	switch (type) {
		case 'character varying':
			return 'STRING';
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
				return 'ARRAY(DataTypes.INTEGER)';
			}
			else if (udt.indexOf('uuid') >= 0) {
				return 'ARRAY(DataTypes.UUID)';
			}
			else if (udt.indexOf('varchar') >= 0) {
				return 'ARRAY(DataTypes.STRING)';
			}
			throw udt;
	}
	return type.toUpperCase();
}
function translateDefaultValue(def) {
	if (!def) return null;
	switch (def) {
		case 'uuid_generate_v4()':
			return 'DataTypes.UUIDV4';
	}
	const ind = def.indexOf('::');
	if (ind > 0) {
		def = def.substring(0, ind);
	}
	if (def == "ARRAY[0]") return null;
	return def;
}
function getColumnObject(c, t) {
	// refine id check
	const def = translateDefaultValue(c.column_default);
	return `
		'${underscoreToCamelCase(c.column_name)}': {
			type: DataTypes.${getColumnType(c.data_type, c.udt_name)},
			field: '${c.column_name}'${c.column_name == `${t}_id` ? `,
			primaryKey: true`: ''},
			allowNull: ${c.is_nullable == 'YES'},${def ? `
			defaultValue: ${def},` : ''}
		}`;
}
function getTSColumnType(type, udt) {
	switch (type) {
		case 'integer':
		case 'money':
		case 'numeric':
		case 'real':
			return 'number';
		case 'character varying':
		case 'text':
		case 'uuid':
			return 'string';
		case 'timestamp without time zone':
		case 'timestamp with time zone':
		case 'date':
			return 'Date';
		case 'bytea':
			return 'any';
		case 'ARRAY':
			if (udt.indexOf('int') >= 0) {
				return 'Array<number>';
			}
			else if (udt.indexOf('uuid') >= 0 || udt.indexOf('varchar') >= 0) {
				return 'Array<string>';
			}
			throw udt;
	}
	return type;
}
function getCSColumnType(type, udt) {
	switch (type) {
		case 'integer':
			return 'int?';
		case 'money':
		case 'numeric':
		case 'real':
			return 'float?';
		case 'uuid':
			return 'System.Guid?';
		case 'character varying':
		case 'text':
			return 'string';
		case 'timestamp without time zone':
		case 'timestamp with time zone':
		case 'date':
			return 'System.DateTime?';
		case 'boolean':
			return 'bool?';
		case 'bytea':
			return 'byte[]';
		case 'ARRAY':
			if (udt.indexOf('int') >= 0) {
				return 'System.Collections.Generic.List<int>';
			}
			else if (udt.indexOf('uuid') >= 0) {
				return 'System.Collections.Generic.List<System.Guid>';
			}
			else if (udt.indexOf('varchar') >= 0) {
				return 'System.Collections.Generic.List<string>';
			}
			throw udt;
	}
	return type;
}
function getTSField(c) {
	return `${underscoreToCamelCase(c.column_name)}: ${getTSColumnType(c.data_type, c.udt_name)}`;
}
function getCSField(c) {
	let type = getCSColumnType(c.data_type, c.udt_name);
	let fld = `
		private ${type} _${underscoreToCamelCase(c.column_name, true)};
		[JsonProperty(PropertyName = "${underscoreToCamelCase(c.column_name)}", NullValueHandling = NullValueHandling.${(c.column_name == `${c.table_name}_id` ? 'Ignore' : 'Include')})]
		public virtual ${type} ${underscoreToCamelCase(c.column_name, true)} 
		{ 
			get { return _${underscoreToCamelCase(c.column_name, true)}; }
			set 
			{
				_${underscoreToCamelCase(c.column_name, true)} = value;
				OnPropertyChanged("${underscoreToCamelCase(c.column_name, true)}");
			}
		}`;
	if (type.endsWith('?')) {
		fld += `	
		[JsonIgnore]
		public virtual ${type.substring(0, type.length - 1)} ${underscoreToCamelCase(c.column_name, true)}Value
		{
			get { return ${underscoreToCamelCase(c.column_name, true)}.GetValueOrDefault(); }
			set
			{ 
				${underscoreToCamelCase(c.column_name, true)} = value;
				OnPropertyChanged("${underscoreToCamelCase(c.column_name, true)}Value");
			}
		}`;
		if (c.data_type == 'timestamp with time zone') {
			fld += `
		[JsonIgnore]
		public virtual System.DateTime? ${underscoreToCamelCase(c.column_name, true)}Timezoned
		{
			get { return ${underscoreToCamelCase(c.column_name, true)} == null ? (System.DateTime?)null : TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(${underscoreToCamelCase(c.column_name, true)}.Value, DateTimeKind.Unspecified), Globalization.TimeZoneInfo); }
			set
			{ 
				${underscoreToCamelCase(c.column_name, true)} = value == null ? (System.DateTime?)null : TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(value.Value, DateTimeKind.Unspecified), Globalization.TimeZoneInfo);
				OnPropertyChanged("${underscoreToCamelCase(c.column_name, true)}Timezoned");
			}
		}
		[JsonIgnore]
		public virtual System.DateTime ${underscoreToCamelCase(c.column_name, true)}TimezonedValue
		{
			get { return ${underscoreToCamelCase(c.column_name, true)}Timezoned.GetValueOrDefault(); }
			set
			{ 
				${underscoreToCamelCase(c.column_name, true)}Timezoned = value;
				OnPropertyChanged("${underscoreToCamelCase(c.column_name, true)}TimezonedValue");
			}
		}
			`;
		}
	}
	return fld;
}
client.connect();
client.query(`select column_name, table_name, data_type, is_nullable, column_default, udt_name
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
				let modelCode = `// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers.js');
const Sequelize = require('sequelize');
				
let db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
	dialect: process.env.DB_DIALECT,
	dialectOptions: { decimalNumbers: true }
});
let models = { db, Sequelize };
let modelDeclares = { };
`;
				let tsModelCode = `// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
				
`;
				for (let t of tables) {
					let csModelCode = `// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
using Newtonsoft.Json;
using System;
using TheTeamTracker.Mobile.DataLayer.Classes;
namespace TheTeamTracker.Mobile.DataLayer.Models.Base
{				
`;
					tsModelCode += `export class ${t.substring(0, 1).toUpperCase()}${underscoreToCamelCase(t).substring(1)} {
`;
					csModelCode += `	public abstract class ${t.substring(0, 1).toUpperCase()}${underscoreToCamelCase(t).substring(1)}Base : EntityBase
	{
`;
					let code = `// !!!! DON'T MAKE CHANGES HERE, THEY WILL BE OVERWRITTEN !!!!
const modelhelpers = require('../helpers/modelhelpers');
function defineModel(sequelize, DataTypes) {
`;
					let cols = dbtables.rows.filter(r => r.table_name == t);
					let hasTimestamps = cols.find(c => c.column_name == 'created_at' || c.column_name == 'updated_at' || c.column_name == 'deleted_at');
					let paranoid = cols.find(c => c.column_name == 'deleted_at');
					cols = cols.filter(c => c.column_name != 'created_at' && c.column_name != 'updated_at' && c.column_name != 'deleted_at');
					code += `	return sequelize.define('${t}', {${cols.map(c => getColumnObject(c, t)).join(',')},
	},
	modelhelpers.getConfig(${hasTimestamps ? 'false' : 'true' }, ${paranoid ? 'true' : 'false'}));
}
function createAssociations(models) {`;
					tsModelCode += `	${cols.map(c => getTSField(c)).join(`;
	`)};`;
					csModelCode += `		${cols.map(c => getCSField(c)).join(`
		`)}`;
					const parents = dbfks.rows.filter(f => f.parent_table == t);
					parents.sort((a, b) => {
						if (a.child_table > b.child_table) return 1;
						if (a.child_table < b.child_table) return -1;
						return 0;
					})
					const children = dbfks.rows.filter(f => f.child_table == t);
					children.sort((a, b) => {
						if (a.parent_table > b.parent_table) return 1;
						if (a.parent_table < b.parent_table) return -1;
						return 0;
					})
					
					let csresets = '';
					for (let p of parents) {
						if (tables.indexOf(p.child_table) < 0) continue;
						const childTable = underscoreToCamelCase(p.child_table);
						const childObjName = p.child_key == p.parent_key ?
							`${childTable}s` : `${underscoreToCamelCase(p.child_key.substring(0, p.child_key.length - 3) + '_'
								+ childTable.substring(0, 1).toUpperCase() + childTable.substring(1))}s`;
						code += `
	models.${underscoreToCamelCase(t)}.hasMany(models.${childTable}, {
		as: '${childObjName}',
		foreignKey: {
			name: '${underscoreToCamelCase(p.child_key)}',
			field: '${p.child_key}'
		},
		targetKey: '${underscoreToCamelCase(p.parent_key)}'
	});`;
						tsModelCode += `
	${childObjName}: Array<${childTable.substring(0, 1).toUpperCase()}${childTable.substring(1)}>;`;
						csresets += `if (${childObjName.substring(0, 1).toUpperCase()}${childObjName.substring(1)} != null)
			{
				foreach (var child in ${childObjName.substring(0, 1).toUpperCase()}${childObjName.substring(1)})	
				{
					child.resetParentsChildren();
				}
			}
		
			`;
						csModelCode += `
		[JsonProperty(PropertyName = "${childObjName}", NullValueHandling = NullValueHandling.Ignore)]
		public virtual System.Collections.ObjectModel.ObservableCollection<${childTable.substring(0, 1).toUpperCase()}${childTable.substring(1)}> ${childObjName.substring(0, 1).toUpperCase()}${childObjName.substring(1)} { get; set; }`;
					}
					for (let p of children) {
						if (tables.indexOf(p.parent_table) < 0) continue;
						const parentTable = underscoreToCamelCase(p.parent_table);
						const parentTableUpper = underscoreToCamelCase(p.parent_table, true);
						const parentObjName = p.child_key.endsWith('_id') ? underscoreToCamelCase(p.child_key.substring(0, p.child_key.length - 3)) : parentTable;
						const parentObjNameUpper = p.child_key.endsWith('_id') ? underscoreToCamelCase(p.child_key.substring(0, p.child_key.length - 3), true) : parentTableUpper;
						code += `
	models.${underscoreToCamelCase(t)}.belongsTo(models.${parentTable}, {
		as: '${parentObjName}',
		foreignKey: {
			name: '${underscoreToCamelCase(p.child_key)}',
			field: '${p.child_key}'
		},
		targetKey: '${underscoreToCamelCase(p.parent_key)}'
	});`;
						tsModelCode += `
	${parentObjName}: ${parentTableUpper};`;
						csModelCode += `
		
		private ${parentTableUpper} _${parentObjNameUpper};
		[JsonProperty(PropertyName = "${parentObjName}", NullValueHandling = NullValueHandling.Ignore)]
		public virtual ${parentTableUpper} ${parentObjNameUpper}
		{ 
			get { return _${parentObjNameUpper}; }
			set
			{
				_${parentObjNameUpper} = value;
				if (_${parentObjNameUpper} != null)
				{
					this._${parentObjNameUpper}Id = _${parentObjNameUpper}.${underscoreToCamelCase(p.parent_key, true)};
				}
				OnPropertyChanged("${parentObjNameUpper}");
			}
		}`;
						csresets += `_${parentObjNameUpper} = null;
			`;
					}
					code += `
}
module.exports = {
	defineModel,
	createAssociations	
};`;
					const mf = underscoreToCamelCase(t);
					fs.writeFileSync(`models/${mf}.js`, code);
					modelCode += `modelDeclares.${mf} = require('./${mf}');
					`;
					tsModelCode += `
}
`;
					csModelCode += `
					
		internal override void resetParentsChildren()
		{
			// TODO: for parents null through
			${csresets}		
		}
	}
}
`;
					const csname = `${mf.substring(0, 1).toUpperCase()}${mf.substring(1)}`;
					fs.writeFileSync(`../TheTeamTrackerMobile/TheTeamTracker.Mobile.DataLayer/Models/Base/${csname}Base.cs`, csModelCode);
					if (!fs.existsSync(`../TheTeamTrackerMobile/TheTeamTracker.Mobile.DataLayer/Models/${csname}.cs`))
						fs.writeFileSync(`../TheTeamTrackerMobile/TheTeamTracker.Mobile.DataLayer/Models/${csname}.cs`,
							`using TheTeamTracker.Mobile.DataLayer.Models.Base;
namespace TheTeamTracker.Mobile.DataLayer.Models
{				
	public class ${t.substring(0, 1).toUpperCase()}${underscoreToCamelCase(t).substring(1)} : ${t.substring(0, 1).toUpperCase()}${underscoreToCamelCase(t).substring(1)}Base
	{
	}
}
`);
				}
				modelCode += `for (let md in modelDeclares) {
	models[md] = modelDeclares[md].defineModel(db, Sequelize)
}
`
				modelCode += `for (let md in modelDeclares) {
	modelDeclares[md].createAssociations(models);
}
				
module.exports = models;`;


				if (!fs.existsSync(`models/index.js`))
					fs.writeFileSync(`models/index.js`, modelCode);
				fs.writeFileSync(`../TheTeamTrackerWeb/src/app/shared/models.ts`, tsModelCode);

			});
	});
