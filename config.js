/**
 * DEVELOPMENT Environment settings
 */
exports.configApp = function(app,express) {
	// App url config
	app.set('server-url', 'http://localhost/');
};

// SocketIO Configure
exports.configIO = function(io) {
	io.set('log level', 4);

	io.set('transports', [
	  'websocket'
	, 'flashsocket'
	, 'htmlfile'
	, 'xhr-polling'
	, 'jsonp-polling'
	]);
};

