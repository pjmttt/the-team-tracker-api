const sharp = require('sharp');
// const fs = require('fs');
const guid = require('../../utils/guid');
const modelhelpers = require('../../helpers/modelhelpers');
const uploadhelper = require('../../helpers/uploadhelper');

async function getImage(models, id, user) {
	const maintenanceRequestImage = await models.maintenanceRequestImage.findById(id);
	try {
		maintenanceRequestImage.image = await uploadhelper.downloadFile(`maintenanceRequestImages/${user.companyId}/${maintenanceRequestImage.maintenanceRequestId}/${id}.${maintenanceRequestImage.imageType.replace('image/', '')}`);
	}
	catch (e) {
		// TODO:
		console.log("Error retrieving image:", e);
	}
	return maintenanceRequestImage;
}

async function uploadImage(models, files, id, user) {
	const images = [];
	const emailAttachments = [];

	for (let f of files) {
		const img = await sharp(f.buffer)
			.max()
			.resize(1024, 768)
			.withoutEnlargement()
			.toBuffer();
		const imgid = guid();
		const fileName = `${imgid}.${f.mimetype.replace('image/', '')}`;
		await uploadhelper.uploadFile(`maintenanceRequestImages/${user.companyId}/${id}/${fileName}`, img);

		images.push({
			maintenanceRequestId: id,
			maintenanceRequestImageId: imgid,
			imageType: f.mimetype,
			updatedBy: user.email,
		});
		emailAttachments.push({
			attachment: img,
			attachmentName: fileName,
			attachmentType: f.mimetype,
		});
	}

	let results = {};
	const transaction = await models.db.transaction();
	try {
		created = (await models.maintenanceRequestImage.bulkCreate(images, { transaction }));
		results = created.map(i => {
			return {
				imageType: i.imageType,
				maintenanceRequestImageId: i.maintenanceRequestImageId
			}
		});

		let maintEmls = await models.emailQueue.findAll({ where: { parentId: id }, transaction });
		for (let me of maintEmls) {
			const attachmentQueue = emailAttachments.map(a =>
				Object.assign({ emailQueueId: me.emailQueueId }, a));
			await models.emailQueueAttachment.bulkCreate(attachmentQueue, { transaction });
		}
		await transaction.commit();
	}
	catch (e) {
		await transaction.rollback();
		throw e;
	}

	return results;
}

// LEGACY
async function getImagesWithContent(models, maintenanceRequestId, user, req, res) {
	const images = await models.maintenanceRequestImage.findAll({
		where: { maintenanceRequestId }
	});
	const results = [];
	for (let i of images) {
		try {
			const result = modelhelpers.getFormattedResult(i, models.maintenanceRequestImage, req, res);
			result.image = await uploadhelper.downloadFile(`maintenanceRequestImages/${user.companyId}/${i.maintenanceRequestId}/${i.maintenanceRequestImageId}.${i.imageType.replace('image/', '')}`);
			results.push(result);
		}
		catch (e) {
			// TODO:
			continue;
		}
	}
	return {
		data: results
	};
}

async function deleting(id, user, models) {
	try {
		const mri = await models.maintenanceRequestImage.findById(id);
		await uploadhelper.deleteFile(`maintenanceRequestImages/${user.companyId}/${mri.maintenanceRequestId}/${id}.${mri.imageType.replace('image/', '')}`);
	}
	catch (e) {
		// TODO:
		console.log("E:", e);
	}
}

function getWhere(req, res) {
	return {
		maintenanceRequestId: req.params.maintenanceRequestId
	}
}

module.exports = {
	getImage,
	getImagesWithContent,
	uploadImage,
	deleting,
	getWhere,
}