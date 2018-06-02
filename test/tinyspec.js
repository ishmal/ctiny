const assert = require("assert");
const Tiny = require("../src/tiny");

describe("routing", () => {

	let tiny = new Tiny();

	it("should encode and decode lots of keys", () => {
		for (let i = 0; i < 10000000 ; i++) {
			let encoded = tiny.encode(i);
			//console.log(encoded);
			let decoded = tiny.decode(encoded);
			assert.equal(i, decoded);
		}
	});


});