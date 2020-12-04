module.exports = function (input) {
	const parts = input.split('_');
	let output = parts[0];
	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];
		output += part.substring(0, 1).toUpperCase() + part.substring(1);
	}
	return output;
}