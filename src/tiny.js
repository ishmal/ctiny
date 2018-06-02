
const DIGITS_NORMAL = [
	"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
	"k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u",
	"v", "w", "x", "y", "z"
];

const DIGITS_OPTIMIZED = [
	"e", "i", "s", "h", "t", "m", "o", "a", "b", "c",
	"d", "f", "g", "j", "k", "l", "n", "p", "q", "r", "u",
	"v", "w", "x", "y", "z"
];

const DIGITS = DIGITS_OPTIMIZED;
const DIGITS_LEN = DIGITS.length;

//make a char --> value lookup table
const DIGITS_REV = DIGITS.reduce((t, v, idx) => { t[v] = idx; return t; }, {});


const TIMEOUT = 3 * 60 * 60 * 1000;

/**
 * Simple service that creates and manages "tiny" URLs
 */
class Tiny {
	constructor() {
		this.table = {};
		this.get = (req, res) => {
			return this.handleGet(req, res);
		};
		this.post = (req, res) => {
			return this.handlePost(req, res);
		};
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

	encode(nr) {
		let code = "";
		let size = DIGITS.length;
		do {
			let n = nr % DIGITS_LEN;
			code = DIGITS[n] + code; //prepend
			nr = (nr / DIGITS_LEN) | 0;
		} while (nr > 0);
		return code;
	}

	decode(str) {
		str = str.toLowerCase();
		let len = str.length;
		let val = 0;
		for (let i = 0; i < len ; i++) {
			let c = str.charAt(i);
			if (c < "a" || c > "z") {
				return -1;
			}
			let v = DIGITS_REV[c];
			val = val * 26 + v;
		}
		return val;
	}

	generateHash() {
		let table = this.table;
		for (let i = 0; i < 10000000 ; i++) {
			if (!table[i]) {
				return i;
			}
		}
		return null;
	}

	create(url) {
		let table = this.table;
		let index = this.generateHash();
		if (index !== null) {
			table[index] = {
				timeout: Date.now() + TIMEOUT,
				url: url
			};
			let encoded = this.encode(index);
			return encoded;
		} else {
			//what?
		}
		this.gc();
	}

	fetch(shortUrl) {
		let table = this.table;
		let index = this.decode(shortUrl);
		let res = table[index] || { url: null };
		let url = res.url;
		this.gc();
		return url;
	}

	handleGet(req, res) {
		let shortUrl = req.params.url;
		let fullUrl = this.fetch(shortUrl);
		res.type("text/plain");
		res.send(fullUrl);	
	}

	handlePost(req, res) {
		let url = req.body.url;
		let shortUrl = this.create(url);
		res.type("text/plain");
		res.send(shortUrl);	
	}


}

module.exports = Tiny;
