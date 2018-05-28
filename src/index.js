
const text = `
<!DOCTYPE html>
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
<input class="urlfield" type="text" name="url/>
<input type="submit" value="Create" />
</form>

</body>

</html>
`;


function index(req, res, next) {
	res.send(text);
	next();
}

module.exports = index;
