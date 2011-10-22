/**
 * This is Main server router
 * @author Tang Bo Hao
 */

/**
 * Module Dependence
 */
var app = require('../server');

// export module
module.exports = function Router(){
};

// Setup the errors
app.error(function(err, req, res, next){
		if (err instanceof NotFound) {
        res.render('404', { locals: { 
                 title : '404 - Not Found'
                },layout:false,status: 404 });
    } else {
        res.render('500', {locals: { 
                 title : 'The Server Encountered an Error'
                 ,error: err 
                },layout:false,status: 500 });
    }
});

app.get('/*', function commonCheck (req, res, next) {
	res.send('hello world');
})