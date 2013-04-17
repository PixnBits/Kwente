KWENTE.drawing2D.shapes.point = function(options){
	
	options = KWENTE.ensureDefaults( options, {
		x:null,
		y:null,
		z:null,
		
		style : {
			color : '#000000',
			radius : 4,
			type : '*'
		}
	});
	
	this.x = options.x;
	this.y = options.y;
	this.z = options.z;
	
	this.style = options.style;
	
	//TODO
};

KWENTE.drawing2D.shapes.point.prototype.draw = function( scene ){

	//TODO points are intrinically fully-defined?
	
	scene.draw_point( this, this.style );
};

/*
 * distance to another point
 */
KWENTE.drawing2D.shapes.point.prototype.distance = function(otherPoint){
	
	if( ! (otherPoint.x && otherPoint.y && otherPoint.z) ){
		console.error("attempting to find distance to non-point: ", otherPoint );
		return null;
	}
	
	return Math.sqrt( otherPoint.x * otherPoint.x + otherPoint.y * otherPoint.y + otherPoint.z * otherPoint.z );
};