function getTimer()
{
	return new Date().getTime();
}

$(function() {
	
	function updateLayout () {
	    // document.body.setAttribute("orient", "landscape");
	    window.scrollTo(0, 1);
	}
	
	// iPhone.DomLoad(updateLayout);
	setTimeout(updateLayout, 100);
	
	$(".btn").click(function() {
		var id = $(this).attr("name");
		
		logger(id);
		
		// register to server
		$.getJSON('connect/'+id, function(data) {
			if(data.error)
				console.log(data);
			else
			{
				console.log('OK!');
				
				$("#controller").show();
				$("#mobilemain").hide();
			}	
		});
	});
	
	$("#mobilemain").show();
	$("#controller").hide();
	
	
	////////////////////////////////////////////////////////////////////////////////////
	// Controlling Posting
	//
	
	
	if( "<%= platform.is.iOS %>" === "true" )
	{
		// safari ios 4.2+ only -_-|||||
		var oldAccX,oldAccY,oldAccZ;

		window.ondevicemotion = function(e) {

			try{
				var acc = e.accelerationIncludingGravity;

				var dx = acc.x - oldAccX;
				var dy = acc.y - oldAccY;
				var dz = acc.z - oldAccZ;
				oldAccX = acc.x;
				oldAccY = acc.y;
				oldAccZ = acc.z;

				var abs = Math.abs;
				var shark = abs(dx) > 20 || abs(dy) > 20 || abs(dz) > 20;
				if(shark){
					post("attack");
				}
			}catch(ex){
				log( ex.message );
			}

		}
	}

	// common movement and click attack
	var oldx, oldy, posx, posy, oldpx, oldpy, isPress, hold;
	var oldvx, oldvy, timer, count;
	var currx, curry, pressx, pressy;
	var isMulTouch;

	var sid = setInterval(function() {
		
		// if(isMulTouch) post("attack");

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

				post("move", {vx:vx, vy:vy} );
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
				post("attack");
			}
			// end scratch attack
		}

		oldx = currx;
		oldy = curry;
	}, 50);

	function ontouchstart (e) {
		try{
			isPress = true;
		
			isMulTouch = getMulTouch(e);
			
			// var t="";
			// for(var i in e.originalEvent.touches[0]) if(typeof(e.originalEvent.touches[0])!=="function") t+=i+":"+e.originalEvent.touches[0][i]+"\n";
			// logger(t);
		
			oldx = posx = currx = pressx = oldpx = getPageX(e);
			oldy = posy = curry = pressy = oldpy = getPageY(e);
			oldvx = oldvy = -1;
			timer = new Date().getTime();
			count  = 0;
			hold = 0;
			
			e.originalEvent.preventDefault();
		}catch(ex){
			logger(ex.message);
		}

	}

	function ontouchmove (e) {
		try{
			
			currx = getPageX(e);
			curry = getPageY(e);
			
			e.originalEvent.preventDefault();
		}catch(ex){
			logger(ex.message);				
		}
	}

	function ontouchend (e) {
		try{

			isPress = false;
			isMulTouch = false;

			// test click attack
			if( pressx == currx && pressy == curry )
			{
				post("attack");
			}
		
			e.originalEvent.preventDefault();
			
		}catch(ex){
			logger(ex.message);
		}
	}
	
	if( "<%= platform.is.iOS %>" === "true" )
	{
		$("#area").bind("touchstart", ontouchstart);
		$("#area").bind("touchmove", ontouchmove);
		$("#area").bind("touchend", ontouchend);
	}
	else
	{
		$("#area").bind("mousedown", ontouchstart);
		$("#area").bind("mousemove", ontouchmove);
		$("#area").bind("mouseup", ontouchend);
	}
	
	function getPageX (e) {
		if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches[0].pageX;
		else
			return e.originalEvent.pageX;
		// body...
	}
	function getPageY (e) {
		if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches[0].pageY;
		else
			return e.originalEvent.pageY;
		// body...
	}
	function getMulTouch (e) {
		if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches && e.originalEvent.touches.length > 1;
		else
			return false;
		// body...
	}
	
	var lastPostTime = getTimer();
	var postInterval = 300; // unit ms
	
	function post ( type, data) {
		
		console.log(type,data);
		
		// client render code
		
		// limit posting times
		// var newTimer = getTimer();
		// if( newTimer - lastPostTime < postInterval ) return;
		// lastPostTime = newTimer;
		
		// send data to socketio
		$.post("/eagleapi/room/rand",{
			type: 'game control',
			gamedata: { 
				user: { id: $.cookie('connect.sid') }, 
				msg: { type:type, data: data || {} }
			},
			sessionKey: $.cookie('connect.sid')
		});
	}
	
	function logger(msg){
		$.post("/eagleapi/room/rand",{
			type: 'logger',
			gamedata: { 
				user: { id: $.cookie('connect.sid') }, 
				msg: msg
			},
			sessionKey: $.cookie('connect.sid')
		});
	}
	
});