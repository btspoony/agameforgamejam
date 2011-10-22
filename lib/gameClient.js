/**
 * A Eagle SocketClient Handler Class
 * Licensed by: MIT
 * @author Tang Bo Hao
 */

/**
 * Module
 */
var SocketClient = require('node-eagle').SocketClient,
	util = require('util');

/**
 * Export Base Class of SocketClient Handler
 * @param {Object} the client to initialize
 * @param {String} which namespace the client is running
 * @api public
 */
var GameClient = module.exports = function GameClientHandler(client) {
	SocketClient.call(this, client);
	
	this.heroes = {
		hero1 :{},
		hero2 :{},
		hero3 :{},
		hero4 :{}
	}
	// Set Accept Event types
	this.acceptEvents.push('restart');
};

// inherit from EventEmitter
util.inherits(GameClient, SocketClient);

/**
 * Eagle Room Handler
 * @api private* 
 */
GameClient.prototype.on_roomjoin = function(roomid, fn) {
	SocketClient.prototype.on_roomjoin.call(this, arguments);
};

GameClient.prototype.on_roomleave = function(fn) {
	SocketClient.prototype.on_roomleave.call(this, arguments);
};

GameClient.prototype.on_restart = function(fn) {
	this.heroes = {
		hero1 :{},
		hero2 :{},
		hero3 :{},
		hero4 :{}
	}
};

