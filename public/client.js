	function alertTemplate(type, msg) {
		const div = document.createElement("div");
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
			const anchor = this.alertsAnchor;
			const div = document.createElement("div");
			div.classList.add("alert", "alert-danger");
			div.textContent = msg;
			anchor.appendChild(div);
			setTimeout(function () {
				anchor.removeChild(div);
			}, 2000);
		}

		alert(msg) {
			const anchor = this.alertsAnchor;
			const div = document.createElement("div");
			div.classList.add("alert", "alert-success");
			div.textContent = msg;
			anchor.appendChild(div);
			setTimeout(function () {
				anchor.removeChild(div);
			}, 2000);
		}

		validateShortUrl(str) {
			const rgx = /^[A-Za-z]{1,5}$/;
			str = str.trim();
			const res = rgx.test(str);
			if (!res) {
				this.error("A Tiny URL is only 1-5 letters A-Z or a-z");
			}
			return res;
		}

		validateUrl(str) {
			const rgx = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/i;
			str = str.trim();
			const res = rgx.test(str);
			if (!res) {
				this.error("invalid URL");
			}
			return res;
		}

		async copyToClipBoard(data) {
			if (navigator.clipboard) {
				try {
					const result = await navigator.permissions.query({
						name: "clipboard-write"
					});
					const ok = (result.state == "granted");
					if (ok) {
						navigator.clipboard.writeText(data);
						this.alert("code copied to clipboard");
					} 
				} catch (err) {
					//if it fails, no big deal
					console.log("clipBoard.writeText did not work");
					return false;
				}
			}
			return true;
		}

		encodeUrl() {
			const plaintext = this.encodeField.value;
			/*
			const res = validateUrl(plaintext);
			if (!res) {
				return;
			}
			*/
			this.decodeField.value = "processing";
			const opts = {
				method: 'POST',
				body: JSON.stringify({
					url: plaintext
				}),
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

		fixURL(url) {
			if (!(url.startsWith("https://") || url.startsWith("http://"))) {
				url = "https://" + url;
			}
			return url;
		}

		decodeUrl() {
			const encoded = this.decodeField.value;
			const res = this.validateShortUrl(encoded);
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
			const encoded = this.decodeField.value;
			const res = this.validateShortUrl(encoded);
			if (!res) {
				return;
			}
			this.encodeField.value = "processing";
			const tinyWindow = window.open("", "ctiny");
			fetch("/tiny/" + encoded)
				.then(res => {
					return res.text();
				})
				.then(url => {
					this.encodeField.value = url;
					tinyWindow.location = this.fixURL(url);
				});

		}

	}

	document.addEventListener("DOMContentLoaded", () => {
		new TinyClient();
	});