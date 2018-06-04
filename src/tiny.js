
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

const TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours
const GC_PERIOD = 3 * 60 * 1000; // 3 minutes
//testing
//const TIMEOUT = 30 * 1000; // 30 seconds
//const GC_PERIOD = 5 * 1000; // 5 seconds

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
		let table = this.table;
		//done this way because table is sparse.
		let keys = Object.keys(table);
		let now = getTime();
		let nrDeleted = 0;
		for (let key of keys) {
			let rec = table[key];
			//console.log("timeout: " + rec.timeout + "  now: " + now);
			if (rec.timeout < now) {
				delete table[key];
				nrDeleted++;
			}
		}
		console.log("Keys freed: " + nrDeleted);
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

	findKey() {
		let table = this.table;
		//search ordinally in spite of being sparse
		for (let i = 0; i < 10000000 ; i++) {
			if (!table[i]) {
				return i;
			}
		}
		return null;
	}

	create(url) {
		//check cache first
		if (url === this.lastUrl) {
			return this.lastShort;
		}
		let table = this.table;

		/**
		 * First see if the url is already shortened.  If
		 * so, simply update it and return the existing short code.
		 */
		let keys = Object.keys(table);
		for (let key of keys) {
			let rec = table[key];
			if (rec.url === url) {
				rec.timeout = getTime() + TIMEOUT;
				let encoded = this.encode(key);
				//update cache
				this.lastUrl = url;
				this.lastShort = encoded;
				return encoded;
			}
		}

		/**
		 * Otherwise find the lowest key in the table, and make
		 * a new record.
		 */
		let index = this.findKey();
		if (index !== null) {
			let encoded = this.encode(index);
			table[index] = {
				timeout: getTime() + TIMEOUT,
				url: url
			};
			//update cache
			this.lastUrl = url;
			this.lastShort = encoded;
			return encoded;
		} else {
			//what?
		}
	}

	fetch(shortUrl) {
		let table = this.table;
		let index = this.decode(shortUrl);
		let res = table[index] || { url: null };
		let url = res.url;
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
