/**
 * Server of Multi SNS MUD Game
 * This file is the core application launcher. 
 */

/**
 * Module dependencies.
 */
var express = require('express'),
	crypto = require('crypto'),
	uaParse = require('./ext/uaparse').uaParse,
	MemoryStore = express.session.MemoryStore;

//Local App Variables
var port = process.env.PORT || 3000;

var app = module.exports = express.createServer();
app.path = __dirname;

// Configuration
var serverurl =  'http://'+process.env.SERVER+":"+port+"/" || 'http://localhost:3000/';

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
	
	// using effcient favicon
	app.use(express.favicon(app.path + '/public/favicon.ico'));
	
	// Start config app
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.store = new MemoryStore();
	app.use(express.session({
		secret: 'gamejam_fj082hA$1sd*FD11sa',
		store: app.store
	}));
	
	app.use(express.methodOverride());
	app.use(express["static"](__dirname + '/public'));
	
	// Enable express router
	app.use(app.router);
	
	// Global Default Locals
	app.locals({ 
		title : 'Game for game jam',
		description: 'A game for HTML5 game jam',
		author: 'Boisgames',
		serverURL:serverurl
	});
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

var Eagle = require('node-eagle').Eagle;
var eagle = new Eagle(app, app.store);

eagle.nsInit(require('./lib/GameClient'));

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

var md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};

// ===== router =====
app.get('/', function main (req, res, next) {
	
	var ua = req.session.ua = uaParse(req.header("User-Agent"));//User-Agent Parsing Here
	
	// if( ua.platform.is.Phone )
	if( ua.browser.safari )
		res.render("mobile", { mobileType: ua.platform.name, platform: ua.platform });
	else
		res.render("index");
});

// ======= Restful ========
app.get('/connect/:id', function (req, res, next) {
	var roomid = eagle.rooms[0];
	
	var type = "heroconnect";
	var data = { hero: req.params.id, session: req.sessionID };
	
	eagle.roomNotify(null, roomid, type, data);
	res.json({ session: req.sessionID }, 200);
})

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
