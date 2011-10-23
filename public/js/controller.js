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
	
	var userId;
	
	$(".btn").click(function() {
		var id = $(this).attr("id");
		userId = id;
		
		// register to server
		$.getJSON('connect/'+id, function(data) {
			if(data.error)
				console.log(data);
			else
			{
				localStorage.setItem("session", data.session);
				
				$("#controller").removeClass("hidden");
				$("#mobilemain").addClass("hidden");
				$("#area").addClass("sel" + userId);
			}	
		});
	});
	
	
	////////////////////////////////////////////////////////////////////////////////////
	// Controlling Posting
	//
	// if( platform.is.iOS )
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
				var shark = abs(dx) > 10 || abs(dy) > 10 || abs(dz) > 10;
				if(shark){
					post("attack");
				}
			}catch(ex){
				logger( ex.message );
			}

		}
	}

	// common movement and click attack
	var oldx, oldy, posx, posy, oldpx, oldpy, isPress, hold;
	var oldvx, oldvy, timer, count;
	var currx, curry, pressx, pressy;
	var touches;
	oldvx = oldvy = 0;

	var sid = setInterval(function() {
		
		// if(isMulTouch) post("attack");
		if(!isPress && touches.length == 0){ post("move", {vx:0, vy:0}); return; }

		if( oldx == currx && oldy == curry )
		{
			// if( ++hold == 3 )
			// {
			// 	logger("stop");
			// 	
			// 	posx = currx;
			// 	posy = curry;
			// 	var vx = posx - oldpx;
			// 	var vy = posy - oldpy;
			// 	var len = Math.sqrt(vx*vx + vy*vy);
			// 	if(len>0) vx = vx / len;
			// 	if(len>0) vy = vy / len;
			// 	oldpx = posx;
			// 	oldpy = posy;
			// 	
			// 	// post("move", {vx:vx, vy:vy} );
			// }
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
			
			var len = Math.sqrt(dx*dx + dy*dy);
			var vx = dx;
			var vy = dy;
			if(len>0) vx /= len;
			if(len>0) vy /= len;
			post("move", {vx:vx, vy:vy} );
		}

		oldx = currx;
		oldy = curry;
	}, 50);

	function ontouchstart (e) {
		try{
			isPress = true;
			touches = e.originalEvent.touches;
		
			// isMulTouch = getMulTouch(e);
			
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
			touches = e.originalEvent.touches;
			
			e.originalEvent.preventDefault();
		}catch(ex){
			logger(ex.message);				
		}
	}

	function ontouchend (e) {
		try{

			isPress = false;
			touches = e.originalEvent.touches;

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
	
	// if( platform.is.iOS )
	{
		$("#area").bind("touchstart", ontouchstart);
		$("#area").bind("touchmove", ontouchmove);
		$("#area").bind("touchend", ontouchend);
	}
	// else
	// {
	// 	$("#area").bind("mousedown", ontouchstart);
	// 	$("#area").bind("mousemove", ontouchmove);
	// 	$("#area").bind("mouseup", ontouchend);
	// }
	
	function getPageX (e) {
		// if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches[0].pageX;
		// else
			// return e.originalEvent.pageX;
	}
	function getPageY (e) {
		// if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches[0].pageY;
		// else
			// return e.originalEvent.pageY;
	}
	function getMulTouch (e) {
		// if( "<%= platform.is.iOS %>" === "true" )
			return e.originalEvent.touches && e.originalEvent.touches.length > 1;
		// else
			// return false;
	}
	
	var lastPostTime = getTimer();
	var postInterval = 100; // unit ms
	
	function post ( type, data) {
		
		// client render code
		
		// limit posting times
		// var newTimer = getTimer();
		// if( newTimer - lastPostTime < postInterval ) return;
		// lastPostTime = newTimer;
		
		if( type == "move" )
		{
			if(oldvx == data.vx && oldvy == data.vy ) return;
			oldvx = data.vx;
			oldvy = data.vy;
		}
		
		if( type == "attack" )
		{
			$("#area").addClass("sel"+userId+"_on").fadeIn(800);
		}
		
		// send data to socketio
		var session = localStorage.getItem("session");
		
		$.post("/eagleapi/room/rand",{
			type: 'game control',
			gamedata: { 
				user: { id: session }, 
				msg: { type:type, data: data || {} }
			},
			sessionKey: session
		});
	}
	
	function logger(msg){
		var session = localStorage.getItem("session");
		
		$.post("/eagleapi/room/rand",{
			type: 'logger',
			gamedata: { 
				user: { id: session }, 
				msg: msg
			},
			sessionKey: session
		});
	}
	
});