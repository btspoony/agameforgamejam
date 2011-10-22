var output;
var gamelog = function(str) {
	output.append(str+"<br />");
};

/**
 * Module export
 */
exports.start = function ( out, heroes ) {
	output = out; // init game out
	
	gamelog("GameStart!");
};

/**
 * Utils Function
 */
var setEntityInfo = function(entity,data) {
	var key;
	for(key in data){
		if(!data.hasOwnProperty(key)) continue;
		
		if(typeof entity[key]) !== 'undefined')
			entity[key] = data[key];
	}
}

var baseInfo = {
	STAGEWIDTH : 960,
	STAGEHEIGHT : 640
};

var staticInfo = {
	monster:{
		x: 280,
		y: 400,
		// w: 160,
		// h: 115,
	},	
	ammo:{
		w: 10,
		h: 10,
	},
};

// Component Defination
// == Global Component ==
Crafty.c("MonsterGene",{
	// Static Member
	GAME_STATUS : ["started","win"],
	
	/**
	 * Initialization
	 */
	init: function() {
		// Game Param
		this.attr('gameStatus',this.GAME_STATUS[0]);
		this.attr('MonsLeft', 50);
		this.attr('MonsTotal', 50);
		
		// Global Status Check
		this.bind("Change",function(){
			var won = this._iswin();
			if(won){
				//TODO goto win stage
			}
		});
	},
	/**
	 * Function Setup Game
	 * @return {String} Return value description
	 */
	_iswin: function() {
		var left = this.attr('MonsLeft');
		if(left == 0){
			return true;
		}else{
			return false;
		}
	},
});

// Monster
Crafty.c('Monster', {
	init: function () {
		this.requires("2D, Canvas, Collision, SpriteAnimation");
		//collision
		this.collision().onHit("Ammo", function () {
			// Be check HP
		});
	},
	playMove: function () {
		// if(!this.isPlaying()){
		// 	var self = this;
		// 	this.delay(function () {
		// 		// var animId = "idle"+Crafty.randRange(1,2);
		// 		// self.bind("AnimationEnd",self.playIdle);
		// 		// self.animate(animId,50);
		// 		self._currentAnim = animId;
		// 	},0);
		// }
		return this;
	},
	playDie: function () {
		return this;
	},
});

// Hero
Crafty.c('Hero', {
	init: function () {
		this.requires("2D, Canvas, SpriteAnimation");
	},
	playMove: function () {
		return this;
	},
	playHitted: function () {
		return this;
	},
	playFiring: function () {
		return this;
	},
	playDie: function () {
		return this;
	},
});

// ======= FX Component ========
Crafty.c("SkillFX",{
	init: function() {
		this.requires("2D, Canvas, Color");
		this.color("red");
		this.visible = false;
	},
	
	/**
	 * play the FX
	 * @return {Object} the entity
	 */
	play: function() {
		this.attr("visible",true);
		this.delay(function () {
			this.attr("visible",false);
		},100);
		return this;
	}
});

Crafty.c("Ammo",{
	init: function () {
		this.requires("2D, Canvas, Color");
		setEntityInfo(this, staticInfo.ammo);
		this.color("green");
	},
	shoot: function (dx, dy) {
		
	},
	_hittest: function () {
		
	}
});

var gameinit = function () {
	// Crafty.background("url('"+imgPath+"bg_main.png') repeat-y"); // Set Game Background
	
	Crafty.load(["images/hero1.png",
	 			"images/hero2.png",
				"images/hero3.png",
				"images/hero4.png",
				"images/monster1.png" ], 
	    function() {
	        //when loaded
	        Crafty.scene("Level1"); //go to main scene
	    },

	    function(e) {
	      //progress
	    },

	    function(e) {
	      //uh oh, error loading
	    }
	);
		
	// Load Game Sprite Sprites
	// Crafty.sprite(160,115,'images/monsterAnim.png',{'monsterSprite':[0,0]});
	
	Crafty.scene("Level1",function (argument) {
		//Set Data
	});
};