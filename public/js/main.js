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

function distance (entityA, entityB) {
	var dx = entityA.x - entityB.x,
		dy = entityA.y - entityB.y;
	return Math.sqrt(dx*dx +dy*dy);
}

function isArray(o) { 
    if (o) {
       return L.isNumber(o.length) && L.isFunction(o.splice);
    }
    return false;
}

function gamelog(str) {
	output.append(str+"<br />");
}

var STAGEWIDTH = 960,
	STAGEHEIGHT = 640;

var staticInfo = {
	monster:{
		x: 280,
		y: 400,
		// w: 160,
		// h: 115,
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
		"MonsterA" : 30,
		"MonsterB" : 40,
		"MonsterC" : 15,
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
		this.attr("MonsTotal", this._monsTotal.length);
		return this;
	},
	start: function () { // Game Start
		var frame = Crafty.frame();
		this._lastSpawnFrame = frame;
		this._lastFrame = frame + 1;
		this.bind('EnterFrame', function (data) {
			var frame = data.frame;
			if((frame - this._lastSpawnFrame) % (this._spawnSpeed * 10) == 0){
				this._lastSpawnFrame = frame;
				
				// Create new Monster
				var spawnLeft = randInt(4)+1,
					total = this._monsTotal,
				 	randPos = randInArray(staticInfo.monsterSpawnPoint),
					name, rndX, rndY;
				while(total.length>0 && spawnLeft>0 ){
					rndX = randInt(50)-25;
					rndY = randInt(50)-25;
					
					name = this._monsTotal.shift();
					Crafty.e(name).spawn(randPos[0]+rndX, randPos[1]+rndY);
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

//  ======= Monsters Component ==========
Crafty.c('Monster', {
	init: function () {
		this.requires("2D, Canvas, Collision, SpriteAnimation, monsterAnim");
		this.visible = false;
		
		//Init Anim
		this.animate("move",[
			[0,0],[0,0],[1,0],[1,0]
		]);
		
		this.animate("die",[
			[2,0],[2,0],[3,0],[3,0],[3,0]
		]);
		
	},
	spawn: function (x, y) {
		this.x = x;
		this.y = y;
		this._movement = {x:0, y:0};
		this.visible = true;
		
		// Die check
		this.bind('EnterFrame', function () {
			if(this._status == "move" ){				
				this._moveToTarget();
				
				if(this.attr('hp') <= 0){
					this.playDie();
				}	
			}
		});
		
		//collision
		this.collision().onHit("Ammo", function (data) {
			// Be check HP
			var weapon, hp;
			data.forEach(function(ele){
				var weapon = ele.obj;
				var hp = this.attr('hp');
				this.attr('hp', hp - weapon.attr("demage"));
				weapon.destroy();
			}, this);
			
		});
		
		this.playMove();
		return this;
	},
	_moveToTarget: function () {
		var mindist = 0;
		heroEntities.forEach(function(entity){
			var dist = distance(entity, this);
			if( mindist == 0 || dist < mindist){
				mindist = dist;
				this._target = entity;
			}
		},this);
		var angle = Math.atan2(this._target.y-this.y, this._target.x-this.x);
		this._movement.x = Math.round(Math.cos(angle) * 1000 * (this.attr('speed')+Math.random()*0.6-0.3) )/1000;
		this._movement.y = Math.round(Math.sin(angle) * 1000 * (this.attr('speed')+Math.random()*0.6-0.3) )/1000;
		
		// Set auto rotate
		this.rotation = angle / Math.PI * 180;
		
		if(mindist>50){
			this.x += this._movement.x;
			this.y += this._movement.y;
		}else{
			this._target.beHitted(this.attr("atk"));
		}
		
		return this;
	},
	playMove: function () {
		this._status = "move";
		this.animate("move", 8, -1);
		return this;
	},
	playDie: function () {
		if(this._status != "die"){
			this._status = "die";
			//TODO Play Anim
			this.animate("die", 10);
			
			this.delay(function(){
				var n = globalEntity.attr("MonsLeft");
				globalEntity.attr("MonsLeft", n - 1);
				
				var t = globalEntity.attr("MonsTotal");
				ui_updateMonsterNum( n, t, n/t );
				this.destroy();
			}, 100);
			
		}
		return this;
	},
});

Crafty.c('MonsterA', {
	init: function () {
		this.requires('Monster');
		
		// monster hp
		this.attr('hp', 1);
		this.attr('speed', 1);
		this.attr('atk', 1);
	},
});
Crafty.c('MonsterB', {
	init: function () {
		this.requires('Monster');
		
		// monster hp
		this.attr('hp', 2);
		this.attr('speed', 0.8);
		this.attr('atk', 1);
	},
});
Crafty.c('MonsterC', {
	init: function () {
		this.requires('Monster');
		
		// monster hp
		this.attr('hp', 5);
		this.attr('speed', 0.6);
		this.attr('atk', 1);
	},
});

//  ======= Hero - Persist Entity ==========
Crafty.c('Hero', {
	init: function () {
		// this.requires("2D, Canvas, SpriteAnimation, Persist, HeroControll");
		this.requires("2D, Canvas, Persist, HeroControll");
		// this.requires("2D, Canvas, Persist, HeroRemoteController");
		
		// Set auto rotate
		this.bind('NewDirection', function(dir){
			if( dir.x == 0 && dir.y == 0 ) return;
			var x = dir.x;
			var y = dir.y;
			this.rotation = Math.atan2(y,x) / Math.PI * 180;
		});
	},
	reset: function() {
		this.wudi = true;
		setEntityInfo(this, staticInfo.heroInitPos);
		this.attr('hp', 3);
		var self = this;
		setTimeout(function(){ self.wudi = false; }, 2000);
		return this;
	},
	beHitted: function ( atk ) {
		if( this.wudi ) return;
		
		var hpnow = this.attr('hp') - atk;
		if(hpnow == 0)
		{
			this.playDie();
		}
		else
		{
			this.reset();
		}
		ui_updateUserHP( this.uiid, hpnow );
		this.attr('hp', hpnow);
	},
	playDie: function () {
		this.destroy();
		return this;
	},
});

Crafty.c('HeroControll',{
	init: function () {
		this.requires("Fourway")
		.fourway(1.5)
		.bind('KeyDown', function(data) {
			var key = data.key;
			if(key === Crafty.keys["J"]){
				this.shoot();
			}
		});
	},
});

Crafty.c('HeroRemoteController',{
	init: function () {
		this._movement = {x:0, y:0};
		
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
		
		gamelog([data.vx, data.vy].join(","));
		
		this._movement.x = data.vx;
		this._movement.y = data.vy;
		this._movement.x *= 2.5;
		this._movement.y *= 2.5;
		
		this.trigger('NewDirection', this._movement);
		
		return this;
	},
        
	attack: function(){
		this.shoot();
	},
});

Crafty.c('hero1', {
	_lastShootTime: 0,
	init: function () {
		this.requires("Hero, avatar1");
		// attr
		this.attr("skillInterval", 6);
		
		this.uiid = "1";
	},
	start: function(){
		this.origin("center");
		return this;
	},
	shoot: function () {
		var interval = this.attr("skillInterval");
		var frame = Crafty.frame();
		if(frame - this._lastShootTime > interval){
			this._lastShootTime = frame;
			// Spawn new Ammo
			Crafty.e("Ammo").from(this);
		}
		return this;
	},
});


Crafty.c('hero2', {
	_lastShootTime: 0,
	init: function () {
		this.requires("Hero, avatar2");
		// attr
		this.attr("skillInterval", 3);
		
		this.uiid = "2";
	},
	start: function(){
		this.origin("center");
		
		this._skill = Crafty.e('Knife').placeby(this);
		this.attach(this._skill);
		// hit test
		this._skill.collision();
		return this;
	},
	shoot: function () {
		var interval = this.attr("skillInterval");
		var frame = Crafty.frame();
		if(frame - this._lastShootTime > interval){
			this._lastShootTime = frame;
			
			this._skill.play();
		}
		return this;
	},
});

// ======= FX Component ========

Crafty.c("Weapon", {
	init: function () {
		this.attr("demage", 1);
	}
});

Crafty.c("Knife",{
	init: function() {
		this.requires("2D, Canvas, Weapon, Collision, daoguang");
		
		this.visible = false;
	},
	/**
	 * play the FX
	 * @return {Object} the entity
	 */
	play: function() {
		this.visible = true;
		this.delay(function () {
			this.visible = false;
		},100);
		
		var hittest = this.hit("Monster");
		if(hittest){
			var self = this;

			// function hitMonster(entity){
			// 	var hp = entity.attr('hp');
			// 	entity.attr('hp', hp - self.attr("demage"));
			// };
			
			hittest.forEach(function (ele) {
				var entity = ele.obj;
				var hp = entity.attr('hp');
				entity.attr('hp', hp - self.attr("demage"));
			},this);
		}
		
		return this;
	},
	placeby: function(parent) {
		this.x = parent.x - (this.w - parent.w)/2;
		this.y = parent.y - (this.h - parent.h)/2;
		return this;
	},
});

Crafty.c("Ammo",{
	_speed: 5,
	init: function () {
		this.requires("2D, Canvas, Weapon, bullet");
	},
	from: function (hero) {
		this.x = hero.x + hero.w/2;
		this.y = hero.y + hero.h/2;
		this.rotation = hero.rotation;
		var dx = - Math.round(Math.cos(this.rotation*(Math.PI/180))*1000 * this._speed)/1000,
			dy = - Math.round(Math.sin(this.rotation*(Math.PI/180))*1000 * this._speed)/1000;
		this.bind("EnterFrame", function() {
			this.x += dx;
			this.y += dy;
			if(this.x< 0 || this.y <0 || this.x > STAGEWIDTH || this.y > STAGEHEIGHT){
				this.destroy();
			}
		});
		
		return this;
	}
});

var globalEntity;
var currentLevel;
var heroEntities = [];

var gameStarted = false;
var can_start = false;
var herocontroller = [0,0,0,0];

function gameinit( heroes ) {
	currentLevel = 1;
	
	for(var i=0; i<10; ++i)
	{
		Crafty.scene("Level"+i,function () {
			// special for Level 1
		
		});
	}

	Crafty.load(
		["images/avatar1.png",
	 	 "images/avatar2.png",
		 "images/bullet.png",
		 "images/daoguang.png",
		 "images/monster.png"], 
	    function() {
	        //when loaded
			Crafty.init(STAGEWIDTH,STAGEHEIGHT);

			Crafty.background("url('images/index_game.jpg') no-repeat"); // Set Game Background

			// Load Game Sprite Sprites
			Crafty.sprite(100,75,'images/avatar1.png',{'avatar1':[0,0]});
			Crafty.sprite(100,75,'images/avatar2.png',{'avatar2':[0,0]});
			Crafty.sprite(15,3,'images/bullet.png',{'bullet':[0,0]});
			Crafty.sprite(26,48,'images/daoguang.png',{'daoguang':[0,0]});
			Crafty.sprite(75,75,'images/monster.png',{'monsterAnim':[0,0]});
			
			// ========== Here create presist entities
			// Create Heroes
			for(var k in heroes){
				gamelog("Create Hero: "+ heroes[k]);
				heroEntities[k] = Crafty.e(heroes[k]);
			}
			
			// Create Global
			globalEntity = Crafty.e('LevelData, MonsterControl');
			
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
	ui_updateMonsterNum(1,1);
	
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
function ui_updateMonsterNum (num, total) {
	var r = num / total;
	$('#monsternum').width( r * 910 );
	$('#monsternum').css("left", 20 + ( 960 - r * 910 ) / 2 );
}
function ui_updateUserHP (id, hp) {
	gamelog([id, hp, 40*hp].join(","));
	$("#user"+id).css("width", 40 * hp);
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
				// try{
					var hero = Number(herocontroller.indexOf( data.user.id ));
					// for(var i in heroEntities) gamelog(i+":"+heroEntities[i]);
					if(hero === -1) return;
					var entity = heroEntities[ hero-1 ];
					entity[ data.msg.type ].apply(entity, [data.msg.data]);
				// }catch(ex){
				// 	gamelog("Exception:"+ex.message);
				// }
			}
		}).on('disconnect', function (msg) {
			output.append('Server Disconnected! <br/>');
		}).on('logger', function(data) {
			gamelog(data.msg);
		});
		
		// when start remove all things
		$('#start_btn').click(function () {
			if(!gameStarted && can_start){
				$('#start_btn').addClass("start_btn_on");
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