const fs = require("fs");
const path = require("path");
const promisify = require("util").promisify;
const mime = require("mime-types");

const p_readFile = promisify(fs.readFile);

/**
 * A simple static file server, since it was
 * no fun configuring express's
 */
class ServeStatic {
	constructor(dir) {
		this.dir = dir;
		this.files = {};
		this.serve = async (req, res) => {
			await this.serveFile(req, res);
		}
	}

	async loadFile(name) {
		let fullName = path.join(this.dir, name);
		try {
			let text = await p_readFile(fullName);
			return {
				text: text,
				length: text.length,
				mimeType: mime.lookup(name)
			};
		} catch(e) {
			return null;
		}
	}

	async serveFile(req, res) {
		let p = req.path;
		if (p === "/" || p === "") {
			p = "index.html";
		} else if (p.charAt(0) === "/") {
			p = p.slice(1);
		}
		let rec = this.files[p];
		if (!rec) {
			rec = await this.loadFile(p);
			if (!rec) {
				res.status(404).send("not found: " + req.path);
				return;
			}
			this.files[p] = rec;
		}
		res.set("Content-Type", rec.mimeType);
		res.set("Content-Length", rec.length);
		res.send(rec.text);
	}
}


module.exports = ServeStatic;
