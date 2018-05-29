
const text = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>CW Tiny</title>
</head>

<body>
<h3>CW TINY</h3>
<p>A URL shortener for CW enthusiasts.</p>

<form action="/tiny" method="POST">
<h4>URL to shorten</h4>
<input class="urlfield" type="text" name="url"></input>
<input type="submit" value="Create" ></input>
</form>

</body>

</html>
`;


function index(req, res) {
	res.type("html");
	res.send(text);
}

module.exports = index;
