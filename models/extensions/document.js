const ROLE = require('../constants').ROLE;
const Op = require('sequelize').Op;
const uploadhelper = require('../../helpers/uploadhelper');

async function uploadDocuments(models, files, user) {
	const documents = [];
	for (let f of files) {
		await uploadhelper.uploadFile(`documents/${user.companyId}/${f.originalname}`, f.buffer);
		// fs.writeFileSync(`documents/${user.companyId}/${f.originalname}`, f.buffer);
		documents.push({
			companyId: user.companyId,
			documentName: f.originalname,
			mimeType: f.mimetype,
			updatedBy: user.email,
		});
	}

	const created = (await models.document.bulkCreate(documents));
	const results = created.map(c => {
		return {
			mimeType: c.mimeType,
			documentName: c.documentName,
			documentId: c.documentId
		}
	});
	return results;
}

async function downloadDocument(models, documentId, user) {
	const doc = await models.document.findById(documentId);
	const content = await uploadhelper.downloadFile(`documents/${user.companyId}/${doc.documentName}`);
	if (!doc || !content) { // !fs.existsSync(`documents/${user.companyId}/${doc.documentName}`)) {
		throw '_400_File not found!';
	}
	return { contentType: doc.mimeType, content };
}

function getWhere(req, res) {
	if (res.locals.user.roles.indexOf(ROLE.ADMIN.value) >= 0) return {};
	return {
		$or: [
			{ positions: null },
			{ positions: { [Op.overlap]: [res.locals.user.positionId] } }
		]
	}
}

module.exports = {
	uploadDocuments,
	downloadDocument,
	getWhere,
}