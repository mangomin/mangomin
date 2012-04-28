var express = require('express');
var app = express.createServer();
var socketIO = require('socket.io');
var io = socketIO.listen(app);
io.set('log level', 2); // reduce logging
var fs = require('fs');


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

io.sockets.on('connection', function (socket) {

	
	var util   = require('util'),
		spawn = require('child_process').spawn,
		//mongostat    = spawn('mongostat', ['--rowcount', '4']);
		mongostat    = spawn('mongostat');
	mongostat.stdout.on('data', function (data) {
		//mongostat.stdin.write(data);
		console.log(data.toString());
		socket.emit('mongostat', data);
	});
	fs.readFile(__dirname + '/config.json', 'ascii', function(err,configData){
	  if(err) {
		console.error("Could not open file: %s", err);
		process.exit(1);
	  }
	  //var emitConfigData = JSON.parse(configData);
	  socket.emit('updateConfig', configData);
	  console.log(configData);
	  //console.log(JSON.stringify(configData));
	});

	
	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		process.kill(mongostat.pid);
	});
	
});
