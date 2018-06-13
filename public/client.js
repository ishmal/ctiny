	
function alertTemplate(type, msg) {
	let div = document.createElement("div");
	div.classList.add("alert", "alert-" + type);
	div.textContent = msg;
	return div;
}

/**
 * Browser client for the CTiny backend
 */
class TinyClient {

	constructor() {
		this.encodeField = document.getElementById("encodeField");
		this.decodeField = document.getElementById("decodeField");
		this.encodeBtn = document.getElementById("encodeBtn");
		this.decodeBtn = document.getElementById("decodeBtn");
		this.decodeAndOpenBtn = document.getElementById("decodeAndOpenBtn");
		this.alertsAnchor = document.getElementById("alerts");

		this.encodeBtn.addEventListener("click", () => {
			this.encodeUrl();
		});
		this.decodeBtn.addEventListener("click", () => {
			this.decodeUrl();
		});
		this.decodeAndOpenBtn.addEventListener("click", () => {
			this.decodeAndOpenUrl();
		});
		this.encodeField.addEventListener("keyup", (evt) => {
			if (evt.keyCode === 13) {
				this.encodeUrl();
				evt.preventDefault();
			}
		});
		this.decodeField.addEventListener("keyup", (evt) => {
			if (evt.keyCode === 13) {
				this.decodeUrl();
				evt.preventDefault();
			}
		});
		//$('.alert').alert()
	}

	error(msg) {
		let anchor = this.alertsAnchor;
		let div = document.createElement("div");
		div.classList.add("alert", "alert-danger");
		div.textContent = msg;
		anchor.appendChild(div);
		setTimeout(function() {
			anchor.removeChild(div);
		}, 2000);
	}

	alert(msg) {
		let anchor = this.alertsAnchor;
		let div = document.createElement("div");
		div.classList.add("alert", "alert-success");
		div.textContent = msg;
		anchor.appendChild(div);
		setTimeout(function() {
			anchor.removeChild(div);
		}, 2000);
	}

	validateShortUrl(str) {
		let rgx = /^[A-Za-z]{1,5}$/;
		str = str.trim();
		let res = rgx.test(str);
		if (!res) {
			this.error("A Tiny URL is only 1-5 letters A-Z or a-z");
		}
		return res;
	}
	
	validateUrl(str) {
		let rgx = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/i;
		str = str.trim();
		let res = rgx.test(str);
		if (!res) {
			this.error("invalid URL");
		}
		return res;
	}
	
	async copyToClipBoard(data) {
		if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(data);
				this.alert("code copied to clipboard");
			  } catch (err) {
				this.error("failed tpo copy code to clipboard");
				console.log("Failed to copy '" + data + "' to clipboard: " + err);
			  }	
		}
	}

	encodeUrl() {
		let plaintext = this.encodeField.value;
		/*
		let res = validateUrl(plaintext);
		if (!res) {
			return;
		}
		*/
		this.decodeField.value = "processing";
		let opts = {
			method: 'POST',
			body: JSON.stringify({ url: plaintext }),
			headers: {
				'Content-Type': 'application/json'
			}
		};
		fetch("/tiny", opts)
		.then(res => {
			return res.text();
		})
		.then(url => {
			this.decodeField.value = url;
			this.copyToClipBoard(url);
		})
		.catch(err => {
			console.log(err);
		});
	}

	decodeUrl() {
		let encoded = this.decodeField.value;
		let res = this.validateShortUrl(encoded);
		if (!res) {
			return;
		}
		this.encodeField.value = "processing";
		fetch("/tiny/" + encoded)
		.then(res => {
			return res.text();
		})
		.then(url => {
			this.encodeField.value = url;
		});
	}

	decodeAndOpenUrl() {
		let encoded = this.decodeField.value;
		let res = this.validateShortUrl(encoded);
		if (!res) {
			return;
		}
		this.encodeField.value = "processing";
		let tinyWindow = window.open("", "ctiny");
		fetch("/tiny/" + encoded)
		.then(res => {
			return res.text();
		})
		.then(url => {
			this.encodeField.value = url;
			tinyWindow.location = url;
		});

	}

}

document.addEventListener("DOMContentLoaded", () => {
	let client = new TinyClient();
});

