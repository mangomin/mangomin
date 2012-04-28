var fs = require('fs');
var util = require('util');

var mongo = require('mongodb');
var DBCommand = require('mongodb/commands/db_command').DBCommand;


// Server objects, one instance per mongo server
function Server (type, config) {
	this.looptime = 1000;
	this.type = type;

	var self = this;

	this.stats = {
		connected: false
	};

	config.type = type;

	// config has no port, extract it from the host
	if (!config.port) {
		var addr = config.ip.split(':');

		if (addr.length > 1) {
			config.ip = addr[0];
			config.port = addr[1];
		} else {
			config.port = 27017;
		}
	}

	this.config = config;

	// fetch the port and return an Int from the configuration array
	this.getPort = function () {
		return parseInt(self.config['port']);
	}

	// fetch the ip from configuration
	this.getIp = function () {
		return self.config['ip'];
	}

	// toString method for prettier output
	this.toString = function () {
		return '[Server ' + util.inspect(self.config) + ']';
	}

	this.checkMongo = function (next) {
		console.log('checking mongo now ' + this);

		self.db.runCommand();

		// check for mongod status
		if (self.type == 'mongod') {
			return next();
		}

		// unknown instance type?
		throw new Error("what to check for " + self.type);
	}

	// does another setTimeout, so we don't hammer the server
	// it's queued for this.looptime until the previous checkMongo finishes
	this.nextLoop = function () {
		setTimeout(self.loop, self.looptime);
	}

	// loop and sleep til next lookup
	this.loop = function () {
		// try .. catch mongo, and keep trying, just spit out exception
		try {
			self.checkMongo(self.nextLoop);
			self.nextLoop();
		} catch (e) {
			console.error(util.inspect(e));
			self.nextLoop();
		}
	}

	this.tryConnection = function () {
		// if not connected then connect
		if (!self.stats.connected) {
			// connect to mongo and use the admin db
			self.server = new mongo.Server(self.getIp(), self.getPort(), {auto_reconnect: true});
			self.db = new mongo.Db('admin', self.server);



			self.db.open(function (err, db) {
				if (err) {
					console.error(util.inspect(err));
					self.stats.connected = false;
					return;
				}

				// we're connected to this mongo server
				self.stats.connected = true;
				self.loop();
			});
		}

		setTimeout(self.tryConnection, 500);
	};

	this.tryConnection();	
}

exports.initialize = function () {
	var self = this;

	this.load_config = function () {
		var config = JSON.parse(fs.readFileSync('config.json'));

		for (var type in config) {
			for (var i in config[type]) {
				servers = new Server(type, config[type][i]);
			}
		}
	}

	console.log('starting connection manager');
	this.load_config();
}