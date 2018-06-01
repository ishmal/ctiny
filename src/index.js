

function outputTemplate(entry) {
	if (!entry) {
		return "";
	}
	return `
<div class="tiny-output">
<div class="tiny-row">
<span>URL:</span><span>${entry.url}</span>
</div>
<div class="tiny-row">
<div>Tiny:</span><span id="shorturl">${entry.shortUrl}</span>
<button class="btn" onclick="copyToClipBoard()">copy</button>
<span id="copyalert"></span>
</div>
</div>
`;

}


function indexTemplate(entry) {

	let output = outputTemplate(entry);

	return `<!DOCTYPE html>
<html>
<head>
<title>CW Tiny</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/styles.css" >
<script>

function copyToClipBoard() {
	var copyText = document.getElementById("shorturl");
	var copyAlert = document.getElementById("copyalert");
	var range = document.createRange();
	range.selectNode(copyText);
	var result = document.execCommand("copy");
	var msg = result ? "copied!" : "not copied!";
	copyAlert.textContent = msg;
	setTimeout(function() {
		copyAlert.textContent = "";
	}, 2000);
}

</script>
</head>

<body>
<h3>CW TINY</h3>
<h5>A URL shortener for CW enthusiasts.</h5>

${output}

<div class="tiny-input">
<form action="/tiny" method="POST">
<h4>URL to shorten</h4>
<div class="tiny-row">
<input class="urlfield" size="80" type="text" name="url"></input>
<input type="submit" class="btn" value="Create" ></input>
</div>
</form>
</div>

</body>

</html>
`;

}


function index(req, res) {
	res.type("html");
	res.send(indexTemplate(null));
}

module.exports = {
	index: index,
	indexTemplate: indexTemplate
};