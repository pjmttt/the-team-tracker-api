const { Storage } = require('@google-cloud/storage');

async function uploadFile(path, buffer) {
	const storage = new Storage();
	const bucket = storage.bucket(process.env.CLOUD_BUCKET);

	const file = bucket.file(path);
	await file.save(buffer);
}

async function downloadFile(path) {
	const storage = new Storage();
	const bucket = storage.bucket(process.env.CLOUD_BUCKET);
	const file = bucket.file(path);
	return await file.download();
}

async function deleteFile(path) {
	const storage = new Storage();
	const bucket = storage.bucket(process.env.CLOUD_BUCKET);
	const file = bucket.file(path);
	return await file.delete();
}

module.exports = {
	uploadFile,
	downloadFile,
	deleteFile,
}