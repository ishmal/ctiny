		function error(msg) {
			let fld = document.getElementById("errorfield");
			fld.textContent = msg;
			setTimeout(function() {
				fld.textContent = "";
			}, 3000);
		}

		function validateShortUrl(str) {
			let rgx = /^[A-Za-z]{1,5}$/;
			str = str.trim();
			let res = rgx.test(str);
			if (!res) {
				error("invalid Tiny URL.  1-5 letters A-Z or a-z");
			}
			return res;
		}
		
		function validateUrl(str) {
			let rgx = /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/i;
			str = str.trim();
			let res = rgx.test(str);
			if (!res) {
				error("invalid URL");
			}
			return res;
		}
		
		function copyToClipBoard() {
			var copyText = document.getElementById("shorturl");
			var copyAlert = document.getElementById("copyalert");
			var range = document.createRange();
			range.selectNode(copyText);
			var result = document.execCommand("copy");
			var msg = result ? "copied!" : "not copied!";
			copyAlert.textContent = msg;
			setTimeout(function () {
				copyAlert.textContent = "";
			}, 2000);
		}

		function encodeUrl() {
			let encodeField = document.getElementById("encodefield");
			let decodeField = document.getElementById("decodefield");
			let plaintext = encodeField.value;
			let res = validateUrl(plaintext);
			if (!res) {
				return;
			}
			decodeField.value = "processing";
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
				decodeField.value = url;
			})
			.catch(err => {
				console.log(err);
			});
		}

		function decodeUrl() {
			let encodeField = document.getElementById("encodefield");
			let decodeField = document.getElementById("decodefield");
			let encoded = decodeField.value;
			let res = validateShortUrl(encoded);
			if (!res) {
				return;
			}
			encodeField.value = "processing";
			let tinyWindow = window.open("", "ctiny");
			fetch("/tiny/" + encoded)
			.then(res => {
				return res.text();
			})
			.then(url => {
				encodeField.value = url;
				tinyWindow.location = url;
			});

		}
