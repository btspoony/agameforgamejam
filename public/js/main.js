var output;

/**
 * Utils Function
 */
function setEntityInfo (entity,data) {
	var key;
	for(key in data){
		if(!data.hasOwnProperty(key)) continue;
		
		if(typeof entity[key] !== 'undefined')
			entity[key] = data[key];
	}
};

function randInt ( int ) {
	return Math.floor(Math.random() * int);
}


function randInArray (arr) {
	var rand = Math.floor(Math.random() * arr.length);
	return arr[rand];
}

var gamelog = function(str) {
	output.append(str+"<br />");
};

var STAGEWIDTH = 960,
	STAGEHEIGHT = 640;

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
	heroInitPos:{
		x: 480,
		y: 360,
	},
	monsterSpawnPoint:[
		[ 0,0 ],
		[ 960,0 ],
		[ 960,640 ],
		[ 0,640 ],
	],
};

var testData = {
	maxMons : 50,
	spawnSpeed : 10,
	monsTotal : {
		"A" : 10,
		"B" : 20,
		"C" : 5,
	},
};

// Component Defination
// == Global Component ==
Crafty.c('LevelData', {
	init: function() {
		//todo
	},
	initLevel: function(data) {
		// change object to array
		var monsTotal = data.monsTotal,
			monsArr = [], k, i, len;
		for(k in monsTotal){
			len = monsTotal[k];
			for(i=0;i<len;i++){
				monsArr.push(k);
			}
		}
		data.monsTotal = monsArr;
		
		this.attr('levelData', data);
		return this;
	}
});

Crafty.c("MonsterControl",{
	_monsTotal: [],
	_spawnSpeed: 10,
	_lastSpawnFrame: 0,
	_lastFrame:0,
	/**
	 * Initialization
	 */
	init: function() {		
		this.requires('Persist');
		
		// Global Status Check
		this.bind("Change",function(){
			var won = this._iswin();
			if(won){
				//TODO goto win stage
				nextLevel();
			}
		});
	},
	reset: function () { // Game Reset
		var data = this.attr('levelData');
		this.attr('MonsLeft', data.maxMons);
		this._monsTotal = data.monsTotal;
		this._spawnSpeed = data.spawnSpeed;
		return this;
	},
	start: function () { // Game Start
		this._lastSpawnFrame = this.frame;
		this._lastFrame = this.frame + 1;
		this.bind('EnterFrame', function () {
			var frame = this.frame;
			if((frame - this._lastSpawnFrame) % this._spawnSpeed == 0){
				this._lastSpawnFrame = frame;
				
				// Create new Monster
				var spawnLeft = randInt(4)+1,
					total = this._monsTotal,
				 	randPos = randInArray(staticInfo.monsterSpawnPoint),
					name;
				while(total.length>0 && spawnLeft>0 ){
					name = this._monsTotal.shift();
					Crafty.e(name).spawn(randPos[0], randPos[1]);
					spawnLeft--;
				}
			}
			this._lastframe = frame;
		});
		return this;
	},
	_iswin: function() {
		var left = this.attr('MonsLeft');
		if(left == 0){
			return true;
		}else{
			return false;
		}
		return this;
	},
});

// Monster
Crafty.c('Monster', {
	_status: "",
	init: function () {
		this.requires("2D, Canvas, Collision, SpriteAnimation");
		this.visible = false;
	},
	spawn: function (x, y) {
		this.x = x;
		this.y = y;
		this.visible = true;
		
		// Die check
		this.bind('EnterFrame', function () {
			this._moveToTarget();
			if(this.attr('hp') <= 0){
				this.playDie();
			}
		});
		
		//collision
		this.collision().onHit("Ammo", function () {
			// Be check HP
		});
		
		this.playMove();
		return this;
	},
	_moveToTarget: function () {
		return this;
	},
	playMove: function () {
		this._status = "move";
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
		if(this._status != "die"){
			this._status = "die";
			//TODO Play Anim
			
			this.delay(function(){
				this.destroy();
			}, 1000);
			
		}
		return this;
	},
});

// Hero - Persist Entity
Crafty.c('Hero', {
	init: function () {
		// this.requires("2D, Canvas, SpriteAnimation, Persist, HeroControll");
		this.requires("2D, Canvas, Persist, HeroControll, HeroRemoteController");
	},
	reset: function() {
		setEntityInfo(this, staticInfo.heroInitPos);
		this.attr('hp', 100);
		return this;
	},
	playMove: function () {
		return this;
	},
	playHitted: function () {
		return this;
	},
	playAttack: function () {
		return this;
	},
	playDie: function () {
		return this;
	},
});

Crafty.c('HeroControll',{
	init: function () {
		this.requires("Fourway")
		.fourway(1.5);
	},
});

Crafty.c('HeroRemoteController',{
	init: function () {
		this.bind("EnterFrame",function() {
			// if (this.disableControls) return;
	
			if(this._movement.x !== 0) {
				this.x += this._movement.x;
				this.trigger('Moved', {x: this.x - this._movement.x, y: this.y});
			}
			if(this._movement.y !== 0) {
				this.y += this._movement.y;
				this.trigger('Moved', {x: this.x, y: this.y - this._movement.y});
			}
		});
	},
	move: function( data ){
		
		this.trigger('NewDirection', this._movement);
		
		this._movement.x = data.vx;
		this._movement.y = data.vy;
		
		return this;
	},
        
	attack: function(){
		
	},
});

Crafty.c('hero1', {
	_lastShootTime: 0,
	init: function () {
		this.requires("Hero, Color");
		// attr
		this.attr("skillInterval", 10);
		
		this.color("red");
		this.attr({w:10,h:10});
	},
	attack: function () {
		var interval = this.attr("skillInterval");
		if(this.frame - this._lastShootTime > interval){
			this._lastShootTime = this.frame;
			// Spawn new Ammo
			Cracy.e("Ammo").from(this);
		}
		return this;
	},
});


Crafty.c('hero2', {
	init: function () {
		this.requires("Hero, Color");
		// attr
		this.attr("skillInterval", 10);
		
		this.color("red");
		this.attr({w:10,h:10});
	},
	attack: function () {
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
	_speed: 10,
	init: function () {
		this.requires("2D, Canvas, Color");
		setEntityInfo(this, staticInfo.ammo);
		this.color("green");
	},
	from: function (hero) {
		this.x = hero.x;
		this.y = hero.y;
		this.rotation = hero.rotation;
		var dx = this._speed * Math.cos(this.rotation);
		var dy = this._speed * Math.sin(this.rotation);
		
		this.bind("EnterFrame", function() {
			this.x += dx;
			this.y += dy;
			if(this.x< 0 || this.y <0 || this.x > STAGEWIDTH || this.y > STAGEHEIGHT){
				this.delay(function(){
					this.destroy();
				}, 500);
			}
		});
		
		return this;
	},
	_hittest: function () {
		return this;
	}
});

var currentLevel;
var heroEntities = [];

var gameStarted = false;
var can_start = true;
var herocontroller = [0,0,0,0];

function gameinit( heroes ) {
	currentLevel = 1;
	
	Crafty.scene("Level1",function () {
		// special for Level 1
	});

	Crafty.load(["images/hero1.png",
	 			"images/hero2.png",
				"images/hero3.png",
				"images/hero4.png",
				"images/monster1.png" ], 
	    function() {
	        //when loaded
			Crafty.init(STAGEWIDTH,STAGEHEIGHT);

			// Crafty.background("url('"+imgPath+"bg_main.png') repeat-y"); // Set Game Background
			Crafty.background("#333"); // Set Game Background

			// Load Game Sprite Sprites
			// Crafty.sprite(160,115,'images/monsterAnim.png',{'monsterSprite':[0,0]});
			
			// ========== Here create presist entities
			// Create Heroes
			for(var k in heroes){
				gamelog("Create Hero: "+ heroes[k]);
				heroEntities[k] = Crafty.e(heroes[k]);
			}
			
			// Create Global
			Crafty.e('LevelData, MonsterControl');
			
			// Start a level
			nextLevel();
	    },

	    function(e) {
	      //progress
	    },

	    function(e) {
	      //uh oh, error loading
	    }
	);
	
	// set game started
	gameStarted = true;
};

function nextLevel() {
	if(currentLevel<10){
		Crafty.scene("Level"+currentLevel); //go to main scene
		
		Crafty("LevelData").each(function(){
			this.initLevel(testData);// todo using deferent data
		});
		
		// Reset all presist entity
		Crafty("Persist").each(function(){
			this.reset();
			if(this.hasOwnProperty('start')) this.start();
		});
		
		currentLevel++;
	}else{
		//TODO End Game
		Crafty.stop();
		gameStarted = false
	}
}

function updateLevelNum (num) {
	$('#levelnum').value(num);
}
function updateMonsterNum (num) {
	$('#monsternum').value(num);
}
function updateUserHP (id, hp) {
	$('#user'+id+".hp").value(hp);
}

$(function(){
	console.log('Page Loaded');
	output = $("#output");

	var sio = window.sio = io.connect();
	sio.on('connect', function () {
		output.append('Server Connected ! <br/>');

		sio.emit('roomjoin', function (roomid) {
			output.append('Room ID: '+ roomid +'<br/>');
		});
		
		sio.on('heroconnect', function (data) { // controller connect
			if(!gameStarted){
				var hero = Number(data.hero.substr(4));
				var session = data.session;

				if(herocontroller.indexOf(session) < 0){
					can_start = true;
					herocontroller[hero] = session;
					$('#hero'+hero).addClass('hero'+hero+'_on');
					output.append('"HERE ' + hero + '" connected ! session is "'+session+'" <br/>');
				}				
			}
		}).on('game control', function (data) {
			if(gameStarted){
				try{
					var hero = Number(herocontroller.indexOf( data.user.id ));
					for(var i in heroEntities) gamelog(i+":"+heroEntities[i]);
					gamelog("hero="+(hero-1));
					if(hero === -1) return;
					var entity = heroEntities[ "hero" + (hero-1) ];
					gamelog(entity);
					gamelog(data.msg.type);
					entity[ data.msg.type ].apply(entity, [data.msg]);
				}catch(ex){
					gamelog(ex.message);
				}
			}
		}).on('disconnect', function (msg) {
			output.append('Server Disconnected! <br/>');
		}).on('logger', function(data) {
			console.log(data.msg);
		});
		
		// when start remove all things
		$('#start_btn').click(function () {
			if(!gameStarted && can_start){
				$('#hero_selector').addClass('hidden');
				$('#cr-stage').removeClass('hidden');
				$('#gameui').removeClass('hidden');
				
				// Game Start
				var heroes = [];
				herocontroller.forEach(function(ele, index){
					if(ele !== 0){
						heroes.push("hero"+index);
					}
				});
				gameinit(heroes);
			}
		});
	});

	// Set global error handler
	sio.socket.on('error', function(msg) {
		output.append('Server Error '+msg+'<br/>');
	});
});