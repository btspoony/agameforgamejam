
exports.start = function( ctrlCallback, area ) {
	
	if( !ctrlCallback ) ctrlCallback = function(type) {};

	function move () {
		ctrlCallback( "move", vx, vy );
	}
	function attack(){
		ctrlCallback( "attack" );
	}
	
	if( platform.is.MultiTouch && platform.is.iOS )
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
	
	var oldMouseX, oldMouseY, vx, vy;
	var timer,frame;
	
	area.addEventListener("touchstart", ontouchstart, false);
	area.addEventListener("touchmove", ontouchmove, false);
	area.addEventListener("touchend", ontouchend, false);
	
	function ontouchstart (e) {
		oldMouseX = e.pageX;
		oldMouseY = e.pageY;
		vx = vy = 0;
		timer = new Date().getTime();
		frame = 0;
	}
	
	function ontouchmove (e) {
		var currVx = vx;
		var currVy = vy;
		
		// test scratch attack
		var d = currVx * vy + currVy * vx;
		var newTimer = new Date().getTime();
		var validInterval = (newTimer - timer < 100);
		var validGesture = d > 0; // vector dot multipuly
		if( validGesture && validInterval ) ++frame;
		else frame = 0;
		
		if( frame > 5 )
		{
			frame = 0;
			attack();
		}
		// end scratch attack
		
		timer = newTimer;
		vx = e.pageX - oldMouseX;
		vy = e.pageY - oldMouseY;
		oldMouseX = e.pageX;
		oldMouseY = e.pageY;
	}

	function ontouchend (e) {
		vx = vy = 0;
		
		// test click attack
		if( oldMouseX == e.pageX && oldMouseY == e.pageY )
		{
			attack();
		}
	}
};