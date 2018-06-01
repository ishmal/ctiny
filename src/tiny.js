
const digits = [
	"a", "b", "c", "d", "e",
	"f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o",
	"p", "q", "r", "s", "t",
	"u", "v", "w", "x", "y",
	"z"
];

const TIMEOUT = 3 * 60 * 60 * 1000;

function template(url, shortUrl) {
	return `
<p>
URL: ${url}
</p>
<p>
Tiny: ${shortUrl}
</p>
`;
}

class Tiny {
	constructor() {
		this.table = {};
	}

	gc() {
		let table = this.table;
		let keys = Object.keys(table);
		let now = Date.now().time;
		for (let key of keys) {
			let rec = table[key];
			if (rec.timeout < now) {
				delete table[key];
			}
		}
	}

	generateHash() {
		let table = this.table;
		for (let nrDigits = 0; nrDigits < 6; nrDigits++) {
			let k = "";
			for (let d = 0; d < 26; d++) {
				k += digits[d];
				if (!table[k]) {
					return k;
				}
			}
		}
		return null;
	}

	create(url) {
		let table = this.table;
		let key = this.generateHash();
		if (key) {
			table[key] = {
				timeout: Date.now() + TIMEOUT,
				url: url
			};
			return key;
		} else {
			//what?
		}
		this.gc();
	}

	fetch(shortUrl) {
		shortUrl = shortUrl.toLowerCase();
		let table = this.table;
		let res = table[shortUrl] || { url: null };
		let url = res.url;
		this.gc();
		return url;
	}

	get(req, res) {
		debugger;
		let shortUrl = req.params.url;
		let fullUrl = this.fetch(shortUrl);
		res.type("text/plain");
		res.send(fullUrl);	
	}

	post(req, res) {
		debugger;
		let url = req.body.url;
		let shortUrl = this.create(url);
		res.type("text/plain");
		res.send(shortUrl);	
	}


}

const service = new Tiny();


module.exports = {
	get: (req, res) => service.get(req, res),
	post: (req, res) => service.post(req, res)
}