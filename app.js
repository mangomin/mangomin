var express = require('express');
var app = express.createServer();

app.get('/', function(req, res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/jquery.min.js', function (req, res) {
  res.sendfile(__dirname + '/jquery.min.js');
});

app.get('/bootstrap-collapse.js', function (req, res) {
  res.sendfile(__dirname + '/bootstrap/js/bootstrap-collapse.js');
});

app.get('/assets/css/bootstrap.css', function (req, res) {
  res.sendfile(__dirname + '/bootstrap/css/bootstrap.css');
});

app.get('/assets/css/bootstrap-responsive.css', function (req, res) {
  res.sendfile(__dirname + '/bootstrap/css/bootstrap-responsive.css');
});


app.listen(3000);
