
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
		/**
		 * For each encoded url, we have a single record, but
		 * 3 tables that reference the record.
		 */
		// Short -> rec
		this.forward = {};
		// URL -> rec
		this.reverse = {};
		// allocation table,  int -> rec
		this.table = {};

		// expose these to container as functions
		this.get = this.handleGet.bind(this);
		this.post = this.handlePost.bind(this);

		this.gcStart();

		// one-off cache
		this.lastUrl = "";
		this.lastShort = null;
	}

	/**
	 * Clear out expired records from the 3 tables
	 */
	gc() {
		const now = getTime();
		let nrDeleted = 0;
		const table = this.table;
		Object.entries(table).forEach(([k, v]) => {
			if (v && v.timeout < now) {
				delete this.forward[v.encoded];
				delete this.reverse[v.plain];
				delete table[k];
				nrDeleted++;
			}
		});	
		console.log(`Records freed: ${nrDeleted}`);
	}

	/**
	 * Start the gc background process
	 */
	gcStart() {
		this.gcInterval = setInterval(() => {
			this.gc();
		}, GC_PERIOD);
	}

	/**
	 * Stop the gc background process
	 */
	gcStop() {
		if (this.gcInterval) {
			clearInterval(this.gcInterval);
			this.gcInterval = null;
		}
	}

	/**
	 * Encode an integer as digits
	 * @param {number} nr integer to encode
	 * @return {string} string of digits
	 */
	encode(nr) {
		let code = "";
		do {
			const n = nr % DIGITS_LEN;
			code = DIGITS[n] + code; //prepend
			nr = (nr / DIGITS_LEN) | 0;
		} while (nr > 0);
		return code;
	}

	/**
	 * Convert a string if digits to an integer
	 * @param {string} str string of digits
	 * @return {number} integer 
	 */
	decode(str) {
		str = str.toLowerCase();
		let val = 0;
		for (let i = 0, len = str.length; i < len ; i++) {
			const c = str.charAt(i);
			if (c < "a" || c > "z") {
				return -1;
			}
			const v = DIGITS_REV[c];
			val = val * DIGITS_LEN + v;
		}
		return val;
	}

	/**
	 * Find the lowest available slot (and thus the shortest 
	 * encoded url) in the allocation table
	 * @return {number} the index of the lowest slot, else null
	 */
	findAvailableSlot() {
		const table = this.table;
		//search ordinally in spite of being sparse
		for (let i = 0; i < 10000000 ; i++) {
			if (!table[i]) {
				return i;
			}
		}
		return null;
	}

	/**
	 * Create a new shortened url from a given long one. 
	 * In order:
	 * 1)  Check the cache for the url
	 * 2)  Check the table for the url
	 * 3)  Make a new one
	 * @param {string} url the url to encode
	 * @return {string} the shortened url
	 */
	create(url) {
		// check cache first
		if (url === this.lastUrl) {
			return this.lastShort;
		}

		/**
		 * First see if the url is already shortened.  If
		 * so, simply update it and return the existing short code.
		 */
		const rec = this.reverse[url];

		if (rec) {
			rec.timeout = getTime() + TIMEOUT;
			const encoded = rec.url;
			this.lastUrl = url;
			this.lastShort = encoded;
			return encoded;
		}

		/**
		 * Otherwise find the lowest key in the table, and make
		 * a new record.
		 */
		const index = this.findAvailableSlot();
		if (index !== null) {
			const encoded = this.encode(index);
			const rec = {
				timeout: getTime() + TIMEOUT,
				url: url,
				encoded: encoded
			};
			this.table[index] = rec;
			this.forward[encoded] = rec;
			this.reverse[url] = rec;
			// update cache
			this.lastUrl = url;
			this.lastShort = encoded;
			return encoded;
		} else {
			return null;
		}
	}

	/**
	 * Convert a short url to the original full orl
	 * @param {string} shortUrl 
	 * @return {string} the plain url if found, else null
	 */
	fetch(shortUrl) {
		const table = this.table;
		const rec = this.forward[shortUrl];
		if (rec) {
			rec.timeout = getTime() + TIMEOUT;
			this.lastUrl = rec.url;
			this.lastShort = rec.encoded;
			return rec.url;
		} else {
			return null;
		}
	}

	/**
	 * Handle an HTTP 'get' for a full url
	 * @param {object} req http request
	 * @param {object} res http response 
	 */
	handleGet(req, res) {
		const shortUrl = req.params.url;
		const fullUrl = this.fetch(shortUrl) || "Not found";
		res.type("text/plain");
		res.send(fullUrl);	
	}

	/**
	 * Handle an HTTP 'post' to create (or fetch) a short URL
	 * @param {object} req http request
	 * @param {object} res http response 
	 */
	handlePost(req, res) {
		const url = req.body.url;
		const shortUrl = this.create(url) || "Not found";
		res.type("text/plain");
		res.send(shortUrl);	
	}


}

module.exports = Tiny;
