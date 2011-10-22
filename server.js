/**
 * Server of Multi SNS MUD Game
 * This file is the core application launcher. 
 */

/**
 * Module dependencies.
 */
var express = require('express'),
	config = require('config');

//Local App Variables
var port = process.env.PORT || 3000;
	
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
	
	// Start config app
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'gamejam_fj082hA$1sd*FD11sa',
	}));
	
	app.use(express.methodOverride());
	app.use(express["static"](__dirname + '/public'));
	
	// Enable express router
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// server start listening
app.listen(port);

// ======= Now Server Started ========

var Eagle = require('eagle').Eagle;
var eagle = new Eagle(app, app.store);

config.configIO(eagle.io);

// Setup the errors
app.error(function(err, req, res, next){
		if (err instanceof NotFound) {
        res.render('single/404', { locals: { 
                 title : '404 - Not Found'
                },layout:false,status: 404 });
    } else {
        res.render('single/500', {locals: { 
                 title : 'The Server Encountered an Error'
                 ,error: err 
                },layout:false,status: 500 });
    }
});

// Global Default Locals
app.locals({ 
	title : 'Game for game jam',
	description: 'A game for HTML5 game jam',
	author: 'Boisgames'
});

// ===== router =====
app.get('/', function main (req, res, next) {
	var ua = req.session.ua = uaParse(req.header("User-Agent"));//User-Agent Parsing Here
	
	if( ua.is.Phone )
		res.render("mobile");
	else
		res.render("index");
})

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
