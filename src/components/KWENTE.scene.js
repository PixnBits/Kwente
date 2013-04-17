/*
 * KWENTE.scene namespace
 */

/*
 * Scene object, stores the canvas stuff
 * TODO In the future, also be the location of any drawing, taking advantage of configurations
 */
KWENTE.scene = function(options){
	options = KWENTE.ensureDefaults( options, { 
		canvas : null
	});
	
	this.nodes = {
		canvas : options.canvas
	};
	
	this.window = {
		x : {
			min : -10,
			max : 10
		},
		y : {
			min : -10,
			max : 10
		},
		canvas : {
			width  : 0,
			height : 0
		}
	};
	
	this.featureTree = [];
	this.openDrawing = null;
	
	this.fui = null;
	this.gui = null;
	
	this.viewMotion = {
		//TODO ??? add in what's used 
	};
	
	
	return this.setup() ? this : false;
};

KWENTE.scene.prototype.setup = function(options){
	
	this.gui = new KWENTE.gui(options);
	
	//options?
	
	// for now, expand the canvas to fit the body/window
	//this.nodes.canvas.style.width  = parseInt(document.body.clientWidth - 10);
	//this.nodes.canvas.style.height = parseInt(document.body.clientHeight * 0.75);
	
	this.context = this.nodes.canvas.getContext("2d");
	
	if( ! this.context ){
		console.error( "2d context getting failed!", this.context, this.nodes.canvas );
		return false;
	}
	
	// better there or here???
	this.nodes.canvas.width  =this.window.canvas.width  = parseInt(document.body.clientWidth  - 10 - 50);
	this.nodes.canvas.height =this.window.canvas.height = parseInt(document.body.clientHeight - 10);
	
	this.viewSquare();
	
	this.fui = new KWENTE.fui({}); // TODO options???
	var that = this;
	this.fui.registerEvent( 'pointer', 'down',   function(states, fui){ that.fuiHandler_pointer_down(  states, fui);});
	this.fui.registerEvent( 'pointer', 'up',     function(states, fui){ that.fuiHandler_pointer_up(    states, fui);});
	this.fui.registerEvent( 'pointer', 'move',   function(states, fui){ that.fuiHandler_pointer_move(  states, fui);});
	this.fui.registerEvent( 'pointer', 'scroll', function(states, fui){ that.fuiHandler_pointer_scroll(states, fui);});
	this.fui.registerEvent( 'button',  'down',   function(states, fui){ that.fuiHandler_button_down(   states, fui);});
	this.fui.registerEvent( 'button',  'up',     function(states, fui){ that.fuiHandler_button_up(     states, fui);});
	
	// start animating
	this.animationCallback();
	
	//TODO finish?
	
	return true;
};

KWENTE.scene.prototype.draw_point = function(pnt, style){
	
	style = KWENTE.ensureDefaults( style , {
		color : "#000000",  // default to black 
		radius : 3,
		type : '*'
	});
	
	var pnt_t = this.translatePoint(pnt);
	var cxt = this.context;
	
	switch( style.type ){
		case 'dot-hollow':
			cxt.beginPath();
			cxt.arc(pnt_t.x, pnt_t.y, style.radius, 0, Math.PI*2, true);
			cxt.closePath();
			cxt.strokeStyle = style.color;
			cxt.stroke();
			break;
		case 'dot' :
		case 'dot-filled':
			cxt.beginPath();
			cxt.arc(pnt_t.x, pnt_t.y, style.radius, 0, Math.PI*2, true);
			cxt.closePath();
			cxt.fillStyle = style.color;
			cxt.fill();
			break;
		case '*':
		default:
			// -
			this.draw_line({x:pnt_t.x-5, y:pnt_t.y},   {x:pnt_t.x+5, y:pnt_t.y},   {dontTranslate:true});
			// \
			this.draw_line({x:pnt_t.x-3, y:pnt_t.y-4}, {x:pnt_t.x+3, y:pnt_t.y+4}, {dontTranslate:true});
			// /
			this.draw_line({x:pnt_t.x-3, y:pnt_t.y+4}, {x:pnt_t.x+3, y:pnt_t.y-4}, {dontTranslate:true});
			break;
	}
	
};

KWENTE.scene.prototype.draw_line = function(ptA, ptB, options){
	
	options = KWENTE.ensureDefaults( options, { 
		style : {
			color : "#000000"  // default to black
		}
	});
	
	// use color
	var cxt = this.context;
	
	var ptA_t, ptB_t;
	if( options && options.dontTranslate ){
		ptA_t = ptA;
		ptB_t = ptB;
	}else{
		ptA_t = this.translatePoint(ptA);
		ptB_t = this.translatePoint(ptB);
	}
	
	//console.log( "drawing line between", ptA_t, "and", ptB_t );
	
	cxt.beginPath();
	cxt.lineWidth = 1;
	cxt.strokeStyle = options.style.color;
	cxt.moveTo(ptA_t.x, ptA_t.y);
	cxt.lineTo(ptB_t.x, ptB_t.y);
	cxt.stroke();
	cxt.closePath();
	//TODO
};

KWENTE.scene.prototype.translatePoint = function(pnt){
	
	if( ! pnt ){
		//console.error( "no point supplied", pnt );
		return false;
	}
	
	if( (! pnt.x && (pnt.x != 0)) || (! pnt.y && (pnt.y != 0)) ){
		//console.error( "attempting to find coordinate of nothing", pnt);
		return false;
	}

	//console.log( "from", pnt, "to (%)", (pnt.x- this.window.x.min)/( this.window.x.max - this.window.x.min ), ( 1 - (pnt.y - this.window.y.min)/(this.window.y.max - this.window.y.min)) );
	var x = (pnt.x- this.window.x.min)/( this.window.x.max - this.window.x.min ) * this.window.canvas.width;
	var y = ( 1 - (pnt.y - this.window.y.min)/(this.window.y.max - this.window.y.min)) * this.window.canvas.height;
	
	return { x:parseInt(x), y:parseInt(y) };
};

KWENTE.scene.prototype.translateCoordinate = function(pnt){
	
	if( ! pnt ){
		console.error( "no coordinate supplied", pnt );
		return false;
	}
	
	var point = pnt.mouse&&pnt.mouse.position || pnt;
	
	if( (! point.x && (point.x != 0)) || (! point.y && (point.y != 0)) ){
		console.error( "attempting to find point of nothing", point, pnt);
		return false;
	}

	var x = ( this.window.x.max - this.window.x.min ) * point.x / this.window.canvas.width + this.window.x.min;
	var y = ( 1 - (point.y / this.window.canvas.height)) * (this.window.y.max - this.window.y.min) + this.window.y.min;
	
	var toReturn = { x:x, y:y };
	
	//if( pnt.mouse&&pnt.mouse.position )
	//	pnt.mouse.position.point = toReturn;
	
	return toReturn;
};


KWENTE.scene.prototype.editDrawing = function(options){
	// TODO options, such as the plane to draw on, or 3D drawing
	options.scene = this; // to allow for drawing calls
	this.featureTree.push( this.openDrawing = new KWENTE.drawing2D.sketch(options) );
	
	console.log( "editDrawing, new one:", this.openDrawing.constructor, this.openDrawing );
};

KWENTE.scene.prototype.addToDrawing = function(geometry, options){
	if( ! (options && options.which) && ! this.openDrawing ){
		console.error( "must specify a drawing to add to", options );
		return false;
	}
	
	return this.openDrawing.addGeometry( geometry );
};

KWENTE.scene.prototype.redraw = function(options){
	options = options || {};
	
	if( options.complete ){
		this.context.clearRect(0, 0, this.nodes.canvas.width, this.nodes.canvas.height);
	}
	
	
	for( var n = 0; n < this.featureTree.length; n++ ){
		if( ! (this.featureTree[n] && this.featureTree[n].draw) ){
			console.error( "feature is not drawable", this.featureTree[n] );
			continue;
		}
		this.featureTree[n].draw();
	}
	
	//TODO finish?
};


KWENTE.scene.prototype.animationCallback = function(){
	//TODO
	this.redraw({complete:true});
	
	// call ourself again
	var that = this;
	window.requestAnimationFrame( function(){ that.animationCallback(); });
	
	//TODO stats?
};

KWENTE.scene.prototype.applyCanvasStyle = function(options){
	for( var n in options ){
		if( this.nodes.canvas.style[n] != undefined )
			this.nodes.canvas.style[n] = options[n];
	}
};

KWENTE.scene.prototype.adjustCoordinate = function( coordinate ){
	//TODO figure out why this affects the fui.state!!
	//return coordinate;
	//console.log( 'canvas.offset Left/Top', kwente.nodes.canvas.offsetLeft, kwente.nodes.canvas.offsetTop );
	coordinate.x -= this.nodes.canvas.offsetLeft;
	coordinate.y -= this.nodes.canvas.offsetTop;
	
	return coordinate;
};

KWENTE.scene.prototype.getAdjustedCoordinate = function( coordinate ){
	return {
		x : coordinate.x - this.nodes.canvas.offsetLeft,
		y : coordinate.y - this.nodes.canvas.offsetTop
	};
};

KWENTE.scene.prototype.viewMove = function( options ){
	options = options || {};
	
	if( options.to && options.to.x && options.to.y){
		
		if( (typeof options.to.x.mid == 'number') && (typeof options.to.y.mid == 'number') ){
			
			var spanHalf;
			if( (typeof options.to.x.span == 'number') && (typeof options.to.y.span == 'number') ){
				spanHalf = {
					x : ( options.to.x.span ) / 2,
					y : ( options.to.y.span ) / 2
				};
			}else{
				spanHalf = {
					x : ( this.window.x.max - this.window.x.min ) / 2,
					y : ( this.window.y.max - this.window.y.min ) / 2
				};
			}
			
			this.window.x.min = options.to.x.mid - spanHalf.x;
			this.window.x.max = options.to.x.mid + spanHalf.x;
			this.window.y.min = options.to.y.mid - spanHalf.y;
			this.window.y.max = options.to.y.mid + spanHalf.y;
			
		}else if( (typeof options.to.x.min == 'number') && (typeof options.to.y.min == 'number') && (typeof options.to.x.max == 'number') && (typeof options.to.y.max == 'number') ){
			this.window.x.min = options.to.x.min;
			this.window.x.max = options.to.x.max;
			this.window.y.min = options.to.y.min;
			this.window.y.max = options.to.y.max;
		}
	}
	
	if( options.scale && (typeof options.scale == 'number')){
		this.window.x.min *= options.scale;
		this.window.x.max *= options.scale;
		
		this.window.y.min *= options.scale;
		this.window.y.max *= options.scale;
		
		//this.window.z.min *= options.scale;
		//this.window.z.max *= options.scale;
		
	}
	
	if( options.translate ){
		if( options.translate.x && (typeof options.translate.x == 'number') ){
			this.window.x.min += options.translate.x;
			this.window.x.max += options.translate.x;
		}
		
		if( options.translate.y && (typeof options.translate.y == 'number') ){
			this.window.y.min += options.translate.y;
			this.window.y.max += options.translate.y;
		}
		
		if( options.translate.z && (typeof options.translate.z == 'number') ){
			this.window.z.min += options.translate.z;
			this.window.z.max += options.translate.z;
		}
	}
	
	if( options.rotate ){
		//TODO rotating the view
		console.error( "rotating not supported yet, probably not until the switch to three.js" );
	}
};

KWENTE.scene.prototype.viewSquare = function(){
	var dx = (this.window.x.max - this.window.x.min) / this.window.canvas.width;
	var dy = (this.window.y.max - this.window.y.min) / this.window.canvas.height;
	
	if( Math.abs(dx - dy) < 1e-5 )
		return;
	
	if( dx > dy ){
		// y needs shrinking
		var yMid = (this.window.y.max + this.window.y.min) / 2;
		var yLenHalf = dx * this.window.canvas.height / 2;
		this.window.y.min = yMid - yLenHalf;
		this.window.y.max = yMid + yLenHalf;
	}else{
		// x needs shrinking
		var xMid = (this.window.x.max + this.window.x.min) / 2;
		var xLenHalf = dy * this.window.canvas.width / 2;
		this.window.x.min = xMid - xLenHalf;
		this.window.x.max = xMid + xLenHalf;
	}
	
};

//TODO rename, this is...horrid
KWENTE.scene.prototype.coordinateDiffPointDiff = function( coordinate ){
	var dx = (this.window.x.max - this.window.x.min) / this.window.canvas.width;
	var dy = (this.window.y.max - this.window.y.min) / this.window.canvas.height;
	
	return {
		x : coordinate.x *  dx,
		y : coordinate.y * -dy
	};
};

//TODO rename, this is...~as bad as coordinateDiffPointDiff
KWENTE.scene.prototype.coordinateDxDy = function(){
	return {
		dx : (this.window.x.max - this.window.x.min) / this.window.canvas.width,
		dy : (this.window.y.max - this.window.y.min) / this.window.canvas.height
	};
};




KWENTE.scene.prototype.fuiHandler_pointer_down = function( states, fui ){
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	//console.log( 'states == statesCorrected', states == statesCorrected, states, statesCorrected);
	//console.log( 'changing statesCorrected', statesCorrected.unique = Math.random(), states.unique || null );
	
	if( states.keyboard.shift ){
		
		this.viewMotion.panBasePointReq = this.fui.requestBasePoint();
		//this.viewMotion.panBasePoint    = this.translateCoordinate( this.fui.getBasePoint(this.viewMotion.panBasePointReq) );
		this.viewMotion.panBasePoint    = {
			x : (this.window.x.max + this.window.x.min)/2,
			y : (this.window.y.max + this.window.y.min)/2
		};
		
		return;
	}

	this.openDrawing.handleDrawingModeEvent('pointer', 'down', statesCorrected);
};

KWENTE.scene.prototype.fuiHandler_pointer_up = function( states, fui ){
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	
	if( states.keyboard.was[ KWENTE.fui_buttons.SHIFT] ){

		//this.fui.releaseBasePoint( this.viewMotion.panBasePointReq );
		//this.viewMotion.panBasePointReq = undefined;
		
		//TODO
	
		return;
	}
	
	if( this.viewMotion.panBasePointReq ){
		this.fui.releaseBasePoint( this.viewMotion.panBasePointReq );
		this.viewMotion.panBasePointReq = undefined;
	}
	
	this.openDrawing.handleDrawingModeEvent('pointer', 'up', statesCorrected);
};

KWENTE.scene.prototype.fuiHandler_pointer_move = function( states, fui ){
	
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	
	if( states.keyboard.shift ){

		if( this.viewMotion.panBasePointReq ){
			var basePointDelta = this.fui.basePointMovement(this.viewMotion.panBasePointReq);
			var basePointDelta_pt = this.coordinateDiffPointDiff( basePointDelta );
			
			var mover = {
				to : {
					x : { mid : this.viewMotion.panBasePoint.x },
					y : { mid : this.viewMotion.panBasePoint.y }
				},
				translate : {
					x : -basePointDelta_pt.x,
					y : -basePointDelta_pt.y
				}
			};
			
			this.viewMove( mover );
		}
		return;
	}
	this.openDrawing.handleDrawingModeEvent('pointer', 'move', statesCorrected);
	
};

KWENTE.scene.prototype.fuiHandler_pointer_scroll = function( states, fui ){
	
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	
	if( states.keyboard.shift ){

		return;
	}
	
	this.viewMove({scale: (statesCorrected.mouse.dz > 0) ? 0.95 : 1.05});
	
	this.openDrawing.handleDrawingModeEvent('pointer', 'scroll', statesCorrected);
	
};

KWENTE.scene.prototype.fuiHandler_button_down = function( states, fui ){
	
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	
	if( states.keyboard.shift ){
		this.applyCanvasStyle({cursor:'move'});
	}
	
	this.openDrawing.handleDrawingModeEvent('button', 'down', statesCorrected);
};

KWENTE.scene.prototype.fuiHandler_button_up = function( states, fui ){
	
	var statesCorrected = KWENTE.copy( states );
	this.adjustCoordinate(statesCorrected.mouse.position);
	
	if( states.keyboard.was[ KWENTE.fui_buttons.SHIFT] && this.nodes.canvas.style.cursor == 'move'){
		this.applyCanvasStyle({cursor:''});
		//console.log( 'fuiHandler_button_up', this.fui.basePointMovement(this.viewMotion.panBasePointReq), this.translateCoordinate( this.fui.basePointMovement(this.viewMotion.panBasePointReq) ) );
		this.fui.releaseBasePoint( this.viewMotion.panBasePointReq );
		this.viewMotion.panBasePointReq = undefined;
	}
	
	this.openDrawing.handleDrawingModeEvent('button', 'up', statesCorrected);
};