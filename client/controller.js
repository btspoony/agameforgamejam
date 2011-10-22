
exports.start = function( area, ctrlCallback, ios ) {
	
	if( !ctrlCallback ) ctrlCallback = function(type) {};

	function move ( vx, vy ) {
		ctrlCallback( "move", {vx:vx, vy:vy} );
	}
	function attack(){
		ctrlCallback( "attack" );
	}
	
	if( ios === "true" )
	{
		// safari ios 4.2+ only -_-|||||
		var oldAccX,oldAccY,oldAccZ;
		window.ondevicemotion = function(e) {
			var acc = e.accelerationIncludingGravity;
			var dx = acc.x - ax;
			var dy = acc.y - ay;
			var dz = acc.z - az;
			oldAccX = acc.x;
			oldAccY = acc.y;
			oldAccZ = acc.z;
			
			var dis2 = dx*dx + dy*dy + dz*dz;
			if(dis2 > 1000){
				attack();
			}
		}
	}
		
	// common movement and click attack
	var oldx, oldy, posx, posy, oldpx, oldpy, isPress, hold;
	var oldvx, oldvy, timer, count;
	var currx, curry, pressx, pressy;
	
	var sid = setInterval(function() {
		
		if(!isPress) return;
				
		if( oldx == currx && oldy == curry )
		{
			if( ++hold == 3 )
			{
				console.log("stop");
				
				posx = currx;
				posy = curry;
				var vx = posx - oldpx;
				var vy = posy - oldpy;
				oldpx = posx;
				oldpy = posy;
				
				move( vx, vy );
			}
		}
		else
		{
			hold = 0;
			
			var newTimer = new Date().getTime();
			var dt = newTimer - timer;
			var dx = currx - oldx;
			var dy = curry - oldy;
			var ds = dx*dx + dy*dy;
			oldvx = dx;
			oldvy = dy;
			timer = newTimer;

			// test scratch attack
			var validInterval = dt < 100;
			var validScratch = Math.abs(dx) > 10 || Math.abs(dy) > 10;
			if( validScratch && validInterval ) ++count;
			else count = 0;
			

			if( count > 5 )
			{
				console.log("scratch");
				count = 0;
				attack();
			}
			// end scratch attack
		}
		
		oldx = currx;
		oldy = curry;
	}, 50);
	
	function ontouchstart (e) {
		isPress = true;
		
		oldx = posx = currx = pressx = oldpx = e.pageX;
		oldy = posy = curry = pressy = oldpy = e.pageY;
		oldvx = oldvy = -1;
		timer = new Date().getTime();
		count  = 0;
		hold = 0;
	}
	
	function ontouchmove (e) {
		currx = e.pageX;
		curry = e.pageY;
	}

	function ontouchend (e) {
		currx = e.pageX;
		curry = e.pageY;
		
		isPress = false;
		
		// test click attack
		if( pressx == currx && pressy == curry )
		{
			attack();
		}
	}
	area.onmousedown = ontouchstart;
	area.onmousemove = ontouchmove;
	area.onmouseup = ontouchend;
	
	area.addEventListener("touchstart", ontouchstart, false);
	area.addEventListener("touchmove", ontouchmove, false);
	area.addEventListener("touchend", ontouchend, false);
};