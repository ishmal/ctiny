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
			let opts = {
				url: "/tiny",
				method: 'POST',
				body: JSON.stringify({ url: plaintext }),
				headers: {
					'Content-Type': 'application/json'
				}
			};
			fetch(opts).then(res => {
				decodeField.value = res;
			})
			.catch(err => {
				console.log(err);
			});
		}

		function decodeUrl() {
			let encodeField = document.getElementById("encodefield");
			let decodeField = document.getElementById("decodefield");
			let encoded = decodeField.value;
			fetch("/tiny/" + encoded)
				.then(res => {
					window.open(res, "cwtiny");
				});

		}
