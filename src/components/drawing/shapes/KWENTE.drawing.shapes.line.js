KWENTE.drawing2D.shapes.line = function(options){
	
	//var options = options_or_pntA && options_or_pntA.x && { points:[options_or_pntA, pntB] } || options_or_pntA;
	options = KWENTE.ensureDefaults( options, {
		points:[
			{x:null, y:null, z:null}, // start
			{x:null, y:null, z:null}, // stop
			{x:null, y:null, z:null}  // midpoint (for snapping)
		]
	});
	
	this.points = [
			new KWENTE.drawing2D.shapes.point(options.points[0]),
			new KWENTE.drawing2D.shapes.point(options.points[1])
	];
	
	//TODO
};

KWENTE.drawing2D.shapes.line.prototype.draw = function( scene ){
	
	var options = {
			style : {}
	};
	//TODO determine if fully-defined or not
	options.style.color = "#0000AA";
	
	scene.draw_line( this.points[0], this.points[1], options );
	scene.draw_point( this.points[0], {type:'dot-filled', style : options.style} );
	scene.draw_point( this.points[1], {type:'dot-filled', style : options.style} );
	this.points[2] = {
		x : (this.points[0].x + this.points[1].x)/2,
		y : (this.points[0].y + this.points[1].y)/2
	};
	scene.draw_point( this.points[2], {type:'dot-hollow', style : options.style} );
};