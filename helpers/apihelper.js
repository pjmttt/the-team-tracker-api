const modelhelpers = require('./modelhelpers');
const ROLE = require('../models/constants').ROLE;
const Op = require('sequelize').Op;

function createErrorResponse(res, e) {
	const errText = e.message || e;
	let match = errText.match(/_(\d*)_(.*)/);
	if (match && match.length == 3) {
		return res.status(parseInt(match[1])).json({ message: match[2] });
	}
	return res.status(500).json({ message: errText, stack: process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test' ? e.stack : undefined });
}

function isAuthorized(modules, roles, res) {
	if (modules && !res.locals.user.company.modules.some(m => modules.includes(m))) return false;
	if (!roles || roles === -1) return true;
	if (res.locals.user.roles.indexOf(ROLE.ADMIN.value) >= 0) return true;
	if (Array.isArray(roles)) {
		for (let r of roles) {
			if (res.locals.user.roles.indexOf(r) >= 0) {
				return true;
			}
		}
	}
	else {
		return res.locals.user.roles.indexOf(roles) >= 0;
	}
	return false;
}

function getLimitOffsetOrder(req, include) {
	let limit = req.query.limit === '0' ? null : req.query.limit;
	let offset = req.query.offset;
	let order = [];
	if (req.query.orderBy) {
		for (let o of req.query.orderBy.split(',')) {
			const orderparts = o.split(' ');
			if (orderparts[0].indexOf('.') > 0) {
				const fldparts = orderparts[0].split('.');
				if (!include) {
					throw '_400_missing includes';
				}
				let inc = include;
				for (let i = 0; i < fldparts.length - 1; i++) {
					inc = inc.find(a => a.as == fldparts[i]);
					if (!inc) {
						throw '_400_missing includes';
					}
				}
				orderparts[0] = fldparts[fldparts.length - 1];
				orderparts.splice(0, 0, Object.assign({}, inc));
			}
			order.push(orderparts);
		}
	}

	return { limit, offset, order };
}

function generateGetApi(endpoint, model, models, router, modules, roles) {
	router.get(endpoint, async (req, res, next) => {
		if (!isAuthorized(modules, roles, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		try {
			let include = [];
			if (model.getIncludes) {
				include = model.getIncludes(models, req, res);
			}
			else if (model.includes) {
				for (let inc of model.includes) {
					include.push({ model: model.associations[inc].target, as: inc, paranoid: false });
				}
			}
			let where = {};
			if (model.attributes["companyId"]) {
				where.companyId = res.locals.user.companyId;
			}

			if (model.getWhere) {
				where = Object.assign(where, model.getWhere(req, res));
			}

			if (req.query.where) {
				let wheres = req.query.where.split(',');
				if (wheres && wheres.length) {
					const and = [];
					if (where)
						and.push(where);
					where = { [Op.and]: and };
					for (let w of wheres) {
						if (!w) continue;
						let whereParts = w.split(' ');
						if (whereParts.length < 3) {
							throw '_400_Invalid where';
						}

						let filtwhere = {};
						let fld = '';
						let fldparts = whereParts[0].split('.');
						let nested = false;
						if (fldparts.length > 1) {
							nested = true;
							if (!include) {
								throw '_400_missing includes';
							}
							let inc = include;
							for (let i = 0; i < fldparts.length - 1; i++) {
								inc = inc.find(a => a.as == fldparts[i]);
								if (!inc) {
									throw '_400_missing includes';
								}
							}
							if (!inc.where) inc.where = {};
							filtwhere = inc.where;
							fld = fldparts[fldparts.length - 1];
						}
						else {
							fld = fldparts[0];
						}
						let whereVal = whereParts.slice(2).join(' ');
						if (whereParts[1] == 'in') whereVal = whereVal.split(';');
						filtwhere[fld] = {
							[Op[whereParts[1]]]: whereVal
						};
						if (!nested)
							and.push(filtwhere);
					}
				}
			}

			const { limit, offset, order } = getLimitOffsetOrder(req, include);

			const results = await model.findAndCountAll({ include, where, limit, offset, order });
			const rows = results.rows.map(r => {
				let formatted = modelhelpers.getFormattedResult(r, model, req, res);
				if (model.includes) {
					for (let inc of model.includes) {
						if (formatted[inc]) {
							const target = model.associations[inc].target;
							if (Array.isArray(formatted[inc])) {
								formatted[inc] = formatted[inc].map((x) => modelhelpers.getFormattedResult(x, target, req, res));
							}
							else {
								formatted[inc] = modelhelpers.getFormattedResult(formatted[inc], target, req, res);
							}
						}
					}
				}
				return formatted;
			});
			return res.status(200).json({
				data: rows,
				count: results.count
			});
		}
		catch (e) {
			return createErrorResponse(res, e);
		}
	});

	router.get(`${endpoint}/:id`, async (req, res, next) => {
		try {
			let include = [];
			if (model.getIncludes) {
				include = model.getIncludes(models, req, res, req.params.id);
			}
			else if (model.includes) {
				for (let inc of model.includes) {
					include.push({ model: model.associations[inc].target, as: inc });
				}
			}
			const result = await model.findById(req.params.id, { include });
			return res.status(200).json(modelhelpers.getFormattedResult(result, model, req, res));
		}
		catch (e) {
			return createErrorResponse(res, e);
		}
	});
}

function generateDeleteApi(endpoint, model, models, router, modules, manageRole) {
	router.delete(`${endpoint}/:id`, async (req, res, next) => {
		if (!isAuthorized(modules, manageRole, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		const transaction = await models.db.transaction();
		const where = {};
		where[model.primaryKeyField] = req.params.id;
		try {
			if (model.deleting) {
				const deleteResult = await model.deleting(req.params.id, res.locals.user, models, transaction, req, res);
				if (deleteResult && deleteResult.statusCode) {
					await transaction.commit();
					return res.status(deleteResult.statusCode).json(deleteResult.payload);
				}
			}

			let result = null;
			if (model.options.paranoid) {
				result = (await model.update({
					deleted_at: new Date(),
					updatedBy: res.locals.user.email
				}, {
						where,
						fields: ['deleted_at', 'updated_by'],
						transaction
					}))[0];
			}
			else {
				result = await model.destroy({ where, transaction });
			}
			if (result) {
				if (model.deleteChildren) {
					for (let d of model.deleteChildren) {
						const am = model.associations[d];
						// TODO:
						// if (am.target.options.paranoid) {
						await am.target.update({
							deleted_at: new Date(),
							updatedBy: res.locals.user.email
						}, {
								where,
								fields: ['deleted_at', 'updated_by'],
								transaction
							});
						// }
					}
				}
				if (model.deleted)
					await model.deleted(req.params.id, res.locals.user, models, transaction, req, res);
				await transaction.commit();
				res.status(204).send();
			}
			else {
				await transaction.rollback();
				res.status(404).send();
			}
		}
		catch (e) {
			await transaction.rollback();
			return createErrorResponse(res, e);
		}
	});
}

function generateApi(endpoint, model, models, router, modules, manageRole, viewRole) {
	generateGetApi(endpoint, model, models, router, modules, viewRole == null || viewRole == undefined ? manageRole : viewRole);
	generateDeleteApi(endpoint, model, models, router, modules, manageRole);

	async function insertRow(row, transaction, req, res, bulk) {
		if (!isAuthorized(modules, -1, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		let item = Object.assign(row, {
			updatedBy: res.locals.user ? res.locals.user.email : row.email
		});
		if (model.attributes["companyId"] && !item.companyId)
			item.companyId = res.locals.user.companyId;
		if (model.creating)
			await model.creating(item, res.locals.user, models, transaction, req, res);
		const result = await model.create(item, { transaction });
		let formatted = modelhelpers.getFormattedResult(result, model, req, res);
		if (model.saveChildren) {
			for (let s of model.saveChildren) {
				if (row[s] && Array.isArray(row[s])) {
					formatted[s] = [];
					const am = model.associations[s];
					for (let c of row[s]) {
						c[am.foreignKey] = result[model.primaryKeyAttribute];
						c.updatedBy = res.locals.user.email;
						const child = await am.target.create(c, { transaction });
						formatted[s].push(modelhelpers.getFormattedResult(child, am.target, req, res));
					}
				}
			}
		}
		if (model.created) {
			await model.created(formatted, res.locals.user, models, transaction, req, res, bulk);
		}

		return formatted;
	}

	async function updateRow(id, row, transaction, req, res, bulk) {
		if (!isAuthorized(modules, -1, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		let item = Object.assign(row, {
			updatedBy: res.locals.user.email
		});
		const where = {};
		where[model.primaryKeyField] = id;
		const prev = await model.findById(id);
		if (model.updating) {
			const updateResult = await model.updating(id, prev, item, res.locals.user, models, transaction, req, res);
			if (updateResult) {
				return updateResult;
			}
		}
		const result = await model.update(item, {
			where,
			fields: Object.keys(item),
			returning: true,
			transaction,
		});
		let formatted = modelhelpers.getFormattedResult(result[1][0], model, req, res);
		if (model.saveChildren) {
			for (let s of model.saveChildren) {
				// only save children
				if (item[s] && Array.isArray(item[s])) {
					formatted[s] = [];
					const am = model.associations[s];
					const amPKey = am.target.primaryKeyAttribute;
					const targetWhere = {};
					targetWhere[am.foreignKey] = formatted[model.primaryKeyAttribute];
					const currChildren = await am.target.findAll({ where: targetWhere })
					for (let c of item[s]) {
						c[am.foreignKey] = formatted[model.primaryKeyAttribute];
						c.updatedBy = res.locals.user.email;
						const curr = c[amPKey] ? currChildren.find((x) => x[amPKey] == c[amPKey]) : null;
						let child = null;
						if (curr) {
							const updateWhere = {};
							updateWhere[amPKey] = c[amPKey];
							child = (await am.target.update(c, {
								where: updateWhere,
								transaction,
								returning: true,
							}))[1][0];
						}
						else {
							if (c[amPKey]) delete c[amPKey];
							child = await am.target.create(c, { transaction });
						}
						formatted[s].push(modelhelpers.getFormattedResult(child, am.target, req, res));
					}

					for (let curr of currChildren) {
						let c = item[s].find((x) => x[amPKey] == curr[amPKey]);
						if (c == null) {
							const destroyWhere = {};
							destroyWhere[amPKey] = curr[amPKey];
							await am.target.destroy(
								{
									where: destroyWhere,
									transaction,
								}
							);
						}
					}
				}
			}
		}
		if (model.updated) {
			await model.updated(id, formatted, prev, res.locals.user, models, transaction, req, res, bulk);
		}

		return formatted;
	}



	router.post(endpoint, async (req, res, next) => {
		if (!isAuthorized(modules, manageRole, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		const transaction = await models.db.transaction();
		try {
			let result = null;
			if (Array.isArray(req.body)) {
				result = [];
				for (let b of req.body) {
					if (b[model.primaryKeyAttribute]) {
						result.push(await updateRow(b[model.primaryKeyAttribute], b, transaction, req, res, true));
					}
					else {
						result.push(await insertRow(b, transaction, req, res, true));
					}
				}
				if (model.bulkInsertUpdate) {
					await model.bulkInsertUpdate(result, res.locals.user, models, transaction, req, res);
				}
			}
			else {
				result = await insertRow(req.body, transaction, req, res);
			}
			await transaction.commit();
			return res.status(201).json(result);
		}
		catch (e) {
			await transaction.rollback();
			return createErrorResponse(res, e);
		}
	});

	router.put(`${endpoint}/:id`, async (req, res, next) => {
		if (!isAuthorized(modules, manageRole, res)) {
			return res.status(403).json({ message: "Unauthorized" });
		}
		const transaction = await models.db.transaction();
		try {
			let result = await updateRow(req.params.id, req.body, transaction, req, res);
			await transaction.commit();
			return res.status(200).json(result);
		}
		catch (e) {
			await transaction.rollback();
			return createErrorResponse(res, e);
		}
	});
}

module.exports = {
	generateGetApi,
	generateApi,
	generateDeleteApi,
	createErrorResponse,
	getLimitOffsetOrder,
}