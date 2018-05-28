

class Tiny {
	constructor() {
	}

	process(url) {
		return "";
	}
}

const service = new Tiny();

function template(url, res) {
	return `
URL: ${url}
Tiny: ${result}
`;
}

function tiny(req, res, next) {
	let url = req.params.url;
	let result = service.process(url);
	let text = template(url, result);
	res.send(text);
	next();
}

module.exports = tiny;
  