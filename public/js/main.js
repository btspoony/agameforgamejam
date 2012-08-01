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

function distance (a, b) {
	var dx = (a.x - a.w/2) - (b.x - b.w/2),
		dy = (a.y - a.h/2) - (b.y - b.h/2);
	return Math.sqrt(dx*dx +dy*dy);
}

function isArray(o) { 
    if (o) {
       return L.isNumber(o.length) && L.isFunction(o.splice);
    }
    return false;
}

function gamelog(str) {
	console.log(str);
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

var getLevelData = function(level){
	var add = 6*(level -1);
	var ret = {
		maxMons : 10 + add ,
		spawnSpeed : 15 - 0.1 * add,
		monsTotal : {
			"MonsterA" : 6 + add/3,
			"MonsterB" : 3 + add/3,
			"MonsterC" : 1 + add/3,
		},
	};
	return ret;
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
		
		this.attr('MonsLeft', data.maxMons);
		this.attr("MonsTotal", data.monsTotal.length);
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
		this._monsTotal = data.monsTotal;
		this._spawnSpeed = data.spawnSpeed;
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
		
		var dx = (heroEntity.x + heroEntity.w/2) - this.x;
		var dy = (heroEntity.y + heroEntity.h/2) - this.y;
		var angle = Math.atan2(dy, dx);
		this._movement.x = Math.round(Math.cos(angle) * 1000 * (this.attr('speed')+Math.random()*0.6-0.3) )/1000;
		this._movement.y = Math.round(Math.sin(angle) * 1000 * (this.attr('speed')+Math.random()*0.6-0.3) )/1000;
		
		// Set auto rotate
		this.rotation = angle / Math.PI * 180;

		var mindist = distance(this, heroEntity);
		if(mindist < 75){
			heroEntity.beHitted(this.attr("atk"));
		}else if(mindist>50){
			this.x += this._movement.x;
			this.y += this._movement.y;
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
			// Play Anim
			this.animate("die", 10);
			
			//set die
			var n = globalEntity.attr("MonsLeft");
			var t = globalEntity.attr("MonsTotal");
			ui_updateMonsterNum( n-1, t );
			globalEntity.attr("MonsLeft", n - 1);
			
			this.timeout(function(){
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
		this.attr('hp', 3);
		this.attr('speed', 0.5);
		this.attr('atk', 1);
	},
});

//  ======= Hero - Persist Entity ==========
Crafty.c('Hero', {
	init: function () {
		this.requires("2D, Canvas, Persist, HeroControll");
		
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
		setTimeout(function(){ self.wudi = false; }, 1000);
		return this;
	},
	beHitted: function ( atk ) {
		if( this.wudi ) return;
		
		// sound
		Crafty.audio.play("death");
		
		var body = Crafty.e('2D, Canvas, Tween, hero_death')
		.attr({x: this.x, y: this.y, alpha:1.0})
		.tween({alpha: 0 }, 900);
		this.timeout(function(){
			body.destroy();
		}, 1000);
		
		var hpnow = this.attr('hp') - atk;
		if(hpnow <= 0)
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
		gameover();
		return this;
	},
});

Crafty.c('HeroControll',{
	init: function () {
		this.requires("Fourway")
		.fourway(3)
		.bind('KeyDown', function (data) {
			var key = data.key;
			if(key === Crafty.keys["J"]){
				this.shoot();
			}
		})
		.bind('Moved', function (origin) {
			if(this.x < 0 || this.x > 880 
			|| this.y < 50 || this.y > 520){
				this.x = origin.x;
				this.y = origin.y;
			}
		});
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
		this._skill.collision(new Crafty.polygon([0,0],[20,0],[20, 20],[0, 20]));	
		return this;
	},
	shoot: function () {
		var interval = this.attr("skillInterval");
		var frame = Crafty.frame();
		if(frame - this._lastShootTime > interval){
			this._lastShootTime = frame;
			this._skill.rotation = this.rotation;
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
		this.origin("center");
		this.visible = false;
		this.attr("demage", 0.5);
	},
	/**
	 * play the FX
	 * @return {Object} the entity
	 */
	play: function() {
		// sound
		Crafty.audio.play("knife");
			
		this.visible = true;
		this.timeout(function () {
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
		// sound
		Crafty.audio.play("gun");
	
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

var currentLevel;
var globalEntity;
var heroEntity;

var gameStarted = false;
var herocontroller = [0,0,0,0];


function gameinit(heroid) {
	currentLevel = 1;
	
	var createLevel = function( i ){
		Crafty.scene("Level"+i,function () {
			Crafty("LevelData").each(function(){
				this.initLevel(getLevelData(i));// todo using deferent data
			});

			// Reset all presist entity
			Crafty("Persist").each(function(){
				this.reset();
				if(this.hasOwnProperty('start')) this.start();
			});
		});	
	};
	for(var i=1; i<10; i++) createLevel(i);
	
	Crafty.scene("End",function () { /*Nothing*/ } );
	
	//Start Game
	
	Crafty.init(STAGEWIDTH,STAGEHEIGHT);

	// ========== Here create presist entities
	gamelog("Create Hero: "+ heroid);
	heroEntity = Crafty.e(heroid);
	
	// Create Global
	globalEntity = Crafty.e('LevelData, MonsterControl');
	
	// Start a level
	nextLevel();
	
	// set game started
	gameStarted = true;
};

function nextLevel() {
	ui_updateMonsterNum(1,1);
	
	if(currentLevel<20){
		updateLevelNum("Level: "+ currentLevel);
		
		Crafty.scene("Level"+currentLevel); //go to main scene
		
		currentLevel++;
	}else{
		//TODO End Game
		Crafty.stop();
		gameStarted = false;
	}
}

var jui_levelNum, jui_monster_num, jui_flashlogo;

function updateLevelNum (level) {
	jui_levelNum.html(level);
}
function ui_updateMonsterNum (num, total) {
	var r = num / total;
	jui_monster_num.width( r * 910 );
	var rest = ( 960 - r * 910 ) / 2;
	jui_monster_num.css("margin-left",  rest);
	jui_monster_num.css("margin-right", rest );
	
	if(num>1) jui_flashlogo.addClass('flashlogo_on').delay(150).queue(function(){
		$(this).removeClass('flashlogo_on');
	});
}
function ui_updateUserHP (id, hp) {
	$("#user"+id).css("width", 40 * hp);
}

function gameover () {
	Crafty.scene("End");
	Crafty.stop();
	gameStarted = false;
	
	$("#gameui").addClass('hidden');
	$("#cr-stage").addClass('hidden');
	$("#background").removeClass("hidden");	
}


$(function(){
	console.log('Page Loaded');
	// init ui
	jui_levelNum = $('#levelnum');
	jui_monster_num = $('#monsternum');
	jui_flashlogo = $('#flashlogo');
	
	var loadingUI = $('#loading');
	Crafty.load(
		["images/avatar1.png",
	 	 "images/avatar2.png",
		 "images/bullet.png",
		 "images/daoguang.png",
		 "images/monster.png",
		 "sound/death.mp3",
		 "sound/gun.mp3",
		 "sound/knife.mp3"], 
	    function() {
			// Load Game Sprite Sprites
			Crafty.sprite(100,75,'images/avatar1.png',{'avatar1':[0,0]});
			Crafty.sprite(100,75,'images/avatar2.png',{'avatar2':[0,0]});
			Crafty.sprite(100,75,'images/hero_death.png',{'hero_death':[0,0]});
			Crafty.sprite(15,3,'images/bullet.png',{'bullet':[0,0]});
			Crafty.sprite(100,75,'images/daoguang.png',{'daoguang':[0,0]});
			Crafty.sprite(75,75,'images/monster.png',{'monsterAnim':[0,0]});
			
			// Add Sound
			Crafty.audio.add("bgm", "sound/bgm.mp3");
			Crafty.audio.add("death", "sound/death.mp3");
			Crafty.audio.add("gun", "sound/gun.mp3");
			Crafty.audio.add("knife", "sound/knife.mp3");
			
			// Play BGM
			Crafty.audio.play("bgm", -1, 0.5);
			
			// Display Selector
			$('#loading').addClass("hidden");
			$('#hero_selector').removeClass('hidden');
			$('.hero').click(function(){
				var self = $(this);
				if(!gameStarted){
					var heroid = self.attr('id');
					$(this).addClass( heroid +'_on');
			
					$('#hero_selector').addClass('hidden');
					$('#main').removeClass('index');
					$('#cr-stage').removeClass('hidden');
					$('#gameui').removeClass('hidden');
			
					// Game Start
					gameinit(heroid);
				}
			});
	    },
	    //progress
	    function(e) {
			loadingUI.html( "Loading ... "+ e.percent+"%" );
	    },
	    function(e) {
			//uh oh, error loading
			gamelog(e);
	    }
	);
	
});