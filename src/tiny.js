
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

// make a char --> value lookup table
const DIGITS_REV = DIGITS.reduce((t, v, idx) => { t[v] = idx; return t; }, {});

const TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours
const GC_PERIOD = 3 * 60 * 1000; // 3 minutes
// testing
// const TIMEOUT = 30 * 1000; // 30 seconds
// const GC_PERIOD = 5 * 1000; // 5 seconds

function getTime() {
	return new Date().getTime();
}

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
		this.gcStart();
		this.lastUrl = "";
		this.lastShort = null;
	}

	gc() {
		const now = getTime();
		let nrDeleted = 0;
		function doTable(table) {
			Object.entries(this.table).forEach(([k, v]) => {
				if (v.timeout < now) {
					delete table[k];
					nrDeleted++;
				}
			});	
		}
		doTable(this.table);
		console.log(`Keys freed: ${nrDeleted}`);
	}

	gcStart() {
		this.gcInterval = setInterval(() => {
			this.gc();
		}, GC_PERIOD);
	}

	gcStop() {
		if (this.gcInterval) {
			clearInterval(this.gcInterval);
			this.gcInterval = null;
		}
	}

	encode(nr) {
		let code = "";
		do {
			const n = nr % DIGITS_LEN;
			code = DIGITS[n] + code; //prepend
			nr = (nr / DIGITS_LEN) | 0;
		} while (nr > 0);
		return code;
	}

	decode(str) {
		str = str.toLowerCase();
		let val = 0;
		for (let i = 0, len = str.length; i < len ; i++) {
			const c = str.charAt(i);
			if (c < "a" || c > "z") {
				return -1;
			}
			const v = DIGITS_REV[c];
			val = val * 26 + v;
		}
		return val;
	}

	findKey() {
		const table = this.table;
		//search ordinally in spite of being sparse
		for (let i = 0; i < 10000000 ; i++) {
			if (!table[i]) {
				return i;
			}
		}
		return null;
	}

	create(url) {
		// check cache first
		if (url === this.lastUrl) {
			return this.lastShort;
		}
		const table = this.table;

		/**
		 * First see if the url is already shortened.  If
		 * so, simply update it and return the existing short code.
		 */
		Object.entries(table).forEach(([k, v]) => {
			if (v.url === url) {
				v.timeout = getTime() + TIMEOUT;
				const encoded = this.encode(k);
				//update cache
				this.lastUrl = url;
				this.lastShort = encoded;
				return encoded;
			}
		});

		/**
		 * Otherwise find the lowest key in the table, and make
		 * a new record.
		 */
		const index = this.findKey();
		if (index !== null) {
			const encoded = this.encode(index);
			table[index] = {
				timeout: getTime() + TIMEOUT,
				url: url
			};
			// update cache
			this.lastUrl = url;
			this.lastShort = encoded;
			return encoded;
		} else {
			// what?
		}
	}

	fetch(shortUrl) {
		const table = this.table;
		const index = this.decode(shortUrl);
		const res = table[index] || { url: null };
		const url = res.url;
		return url;
	}

	handleGet(req, res) {
		const shortUrl = req.params.url;
		const fullUrl = this.fetch(shortUrl);
		res.type("text/plain");
		res.send(fullUrl);	
	}

	handlePost(req, res) {
		const url = req.body.url;
		const shortUrl = this.create(url);
		res.type("text/plain");
		res.send(shortUrl);	
	}


}

module.exports = Tiny;
