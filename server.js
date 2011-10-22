/**
 * Server of Multi SNS MUD Game
 * This file is the core application launcher. 
 */

/**
 * Module dependencies.
 */
var express = require('express'),
	mongoose = require('mongoose'),
	config = require('config');

//Local App Variables
var port = process.env.PORT || 80;
	
var app = module.exports = express.createServer();
app.path = __dirname;

// Configuration
config.configApp(app); // load config parameter

// enable log only on development mode
app.configure("development", function(){
	app.use(express.logger({ format: ':method :url :status' }));
});

//Global Settings
app.configure(function(){
	// View Setting
	app.set('views', app.path + '/views');
	app.register('.html', require('ejs'));
	app.set('view engine', 'html');
	
	// Application Mongoose db configure
	mongoose.connect(app.set('db-uri'));
	// Load application Schema setings
	require('schema');
	
	// Create session store
	var MongoStore = require('connect-mongodb')(express, mongoose.mongo);
	var sessionStore = exports.sessionStore = new MongoStore({url: app.set('db-uri'), collection: 'sys_sessions' });

	// Start config app
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'multisns_mud_game_fj082hA$1sd*FD11sa',
		store:	sessionStore
	}));
	app.use(express.methodOverride());
	app.use(express["static"](__dirname + '/public'));
	
	// Enable express router
	app.use(app.router);
	
	// Global Default Locals
	app.locals({ 
		title : 'Multi SNS Platform - MUD Game',
		description: 'A demo game for CNodeJS Context',
		author: 'Tang Bo Hao',
		analyticssiteid: app.set('google-analytics-key')
	});
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// server start listening
app.listen(port, function(){
	// Routes init
	require('router');	
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
