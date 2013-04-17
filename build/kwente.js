// ---------- ../src\KWENTE.js ---------- //
/*
 * KWENTE namespace
 */

var KWENTE = KWENTE || { REVISION : 1 };

//** Much of this section is from https://github.com/mrdoob/three.js/blob/master/src/Three.js almost verbatim (It's very good) **//

// some compatibility items
self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};

self.Int32Array = self.Int32Array || Array;
self.Float32Array = self.Float32Array || Array;

String.prototype.trim = String.prototype.trim || function () {

	return this.replace( /^\s+|\s+$/g, '' );

};

KWENTE.extend = function ( obj, source ) {

	// ECMAScript5 compatibility based on: http://www.nczonline.net/blog/2012/12/11/are-your-mixins-ecmascript-5-compatible/
	if ( Object.keys ) {
		
		var keys = Object.keys( source );
		for (var i = 0, il = keys.length; i < il; i++) {
			var prop = keys[i];
			Object.defineProperty( obj, prop, Object.getOwnPropertyDescriptor( source, prop ) );
		}
		
	} else {
		
		var safeHasOwnProperty = {}.hasOwnProperty;
		for ( var prop in source ) {
			if ( safeHasOwnProperty.call( source, prop ) ) {
				obj[prop] = source[prop];
			}
		}
		
	}
	
	return obj;
};

//** End of GitHub Three.js section **//

var console = console || window.console || self.console;

// https://developer.mozilla.org/en-US/docs/DOM/window.requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


KWENTE.ensureDefaults = function( options, defaults ){
	if( ! defaults || (typeof defaults != 'object') ){ return options; }
	for(var n in options){ defaults[n] = KWENTE.ensureDefaults( options[n], defaults[n] ); }
	return defaults;
};

KWENTE.copy = function( obj ){
	
	var clone = null;
	if( typeof obj == "object" ){
		clone = {};
		for( var n in obj ){
			clone[n] = KWENTE.copy(obj[n]);
		}
	}else{
		clone = obj;
	}
	
	return clone;
};


// ---------- ../src\components\KWENTE.drawing.js ---------- //
/*
 * KWENTE.drawing namespace
 */

KWENTE.drawing2D = {};
//KWENTE.drawing3D = {};
KWENTE.drawing = KWENTE.drawing2D;

//******//
// sketch - the collections of the shapes
//******//

KWENTE.drawing2D.sketch = function(options){
	
	options = KWENTE.ensureDefaults( options, {
		scene : null,
		origin : new KWENTE.drawing2D.shapes.point({ x:0, y:0, z:0 }),
		nodes : {
		   	relationshipIndicators : [] // ??????
		},
		grid : {
			show : true,
			x : 5,
			y : 5
		},
		geometryList : []
	});
	
	if( ! options.scene ){
		console.error( "KWENTE.drawing2D.sketch needs a valid scene!!", options.scene );
	}
	
	this.scene			= options.scene;
	this.origin			= options.origin;
	//this.nodes
	this.grid			= options.grid;
	this.geometryList	= options.geometryList;
	
	this.drawingMode	= null;
	this.drawingMode_soFar = {};
	//TODO
};

KWENTE.drawing2D.sketch.prototype.DRAWING_MODE_POINT	= 'P';
KWENTE.drawing2D.sketch.prototype.DRAWING_MODE_LINE		= 'L';

KWENTE.drawing2D.sketch.prototype.move = function(options){
	// zoomLevel
	// mode
	//TODO
};

KWENTE.drawing2D.sketch.prototype.drawAxes = function(options){
	// zoomLevel
	// mode
	//TODO
	
	this.scene.draw_line({x:0, y:0},{x:5,y:0},{style:{color:"#FF0000"}});
	this.scene.draw_line({x:0, y:0},{x:0,y:5},{style:{color:"#00FF00"}});
	this.scene.draw_line({x:0, y:0, z:0},{x:0,y:0, z:5},{style:{color:"#0000FF"}});
};

KWENTE.drawing2D.sketch.prototype.draw = function(options){
	this.move({mode:'normalTo'});
	this.drawAxes();
	//TODO now go through all the geometries (sp)
	
	for( var n=0; n < this.geometryList.length; n++){
		if( ! (this.geometryList[n] && this.geometryList[n].draw) ){
			console.error( "geometry is not drawable", this.geometryList[n] );
			continue;
		}
		this.geometryList[n].draw( this.scene );
	}
	
	// now for any construction geometry
	for( var n in this.drawingMode_soFar){
		if( ! (this.drawingMode_soFar[n] && this.drawingMode_soFar[n].draw) ){
			//console.error( "geometry is not drawable", this.drawingMode_soFar[n] );
			continue;
		}
		this.drawingMode_soFar[n].draw( this.scene );
	}
	
};


KWENTE.drawing2D.sketch.prototype.addGeometry = function(geometry, options){
	//TODO compare the constructor? ensure the added geometry is the right type?
	//console.log( "addToDrawing", geometry.constructor );
	
	this.geometryList.push( geometry );
};

KWENTE.drawing2D.sketch.prototype.changeDrawingMode = function( newMode ){
	switch( newMode ){
		case KWENTE.drawing.sketch.prototype.DRAWING_MODE_POINT:
			this.scene.applyCanvasStyle({cursor:'crosshair'});
			break;
		case KWENTE.drawing.sketch.prototype.DRAWING_MODE_LINE:
			this.scene.applyCanvasStyle({cursor:'crosshair'});
			break;
		case null:
			console.log( "Esc? hit, not drawing anymore" );
			this.scene.applyCanvasStyle({cursor:''});
			this.drawingMode_soFar = {};
			break;
		default:
			console.error( "invalid drawing mode, not switching", newMode );
			return false;
			break;
	}
	this.drawingMode = newMode;
	//TODO handle this above, in the event of switching between point and line (example) so that the first bit is kept?
	this.drawingMode_soFar = {};
	return this.drawingMode_soFar;
};

KWENTE.drawing2D.sketch.prototype.handleDrawingModeEvent = function( eventType, eventName, fuiState ){
	
	if( fuiState.keyboard[ KWENTE.fui_buttons.ESCAPE ] ){
		console.log( 'escapeh!', fuiState.keyboard[ KWENTE.fui_buttons.ESCAPE ], fuiState.keyboard, fuiState );
		this.changeDrawingMode( null );
		return false;
	}
	
	if( ! this.drawingMode ){
		return false;
	}
	
	var mousePoint = this.scene.translateCoordinate( fuiState.mouse.position );
	
	//if( eventName != 'move' ){ console.log( 'open drawing mode passed event, with args', eventType, eventName, fuiState ); }
	
	if( this.drawingMode ){
		
		// move a snapping point
		var pnt = this.closestPoint( mousePoint );
		var snapThresh = 5; // pixels
		//TODO this should be in screen pixels, not cartesian points...oops
		if( pnt.dist2 < snapThresh*this.scene.coordinateDxDy().dx ){
			//console.log( 'moving drawing point', pnt.dist2, pnt );
			
			//TODO if( this.drawingMode_soFar.snappingPoint )
			
			this.drawingMode_soFar.snappingPoint = new KWENTE.drawing2D.shapes.point({
				x : pnt.pt.x,
				y : pnt.pt.y,
				style : {
					radius : 5,
					color : '#FF0000',
					type : 'dot-filled'
				}
			});
			
			mousePoint.x = pnt.pt.x;
			mousePoint.y = pnt.pt.y;
		}else if(this.drawingMode_soFar.snappingPoint){
			// remove the snapping point
			this.drawingMode_soFar.snappingPoint = undefined;
		}
		
	}
	
	switch( this.drawingMode ){
		case KWENTE.drawing2D.sketch.prototype.DRAWING_MODE_POINT:
			if( eventType == 'pointer' && eventName == 'up' ){
				if( ! this.drawingMode_soFar.tempPoint ){
					// TODO change the point to a line for async drawing
					this.drawingMode_soFar.tempPoint = new KWENTE.drawing2D.shapes.point({
							x : mousePoint.x,
							y : mousePoint.y
					});
				}else{
					this.drawingMode_soFar.tempPoint = new KWENTE.drawing2D.shapes.point({
							x : mousePoint.x,
							y : mousePoint.y
					});
					
					console.log( 'mousePoint', mousePoint, 'fuiState.mouse.position', fuiState.mouse.position );
					
					this.addGeometry( this.drawingMode_soFar.tempPoint );
					
					this.drawingMode_soFar.tempPoint = new KWENTE.drawing2D.shapes.point({ points:[ {
							x : mousePoint.x,
							y : mousePoint.y
						}, {}] });
				}
			}
			if( eventType == 'pointer' && eventName == 'move' && this.drawingMode_soFar.tempPoint ){
				this.drawingMode_soFar.tempPoint = new KWENTE.drawing2D.shapes.point({
						x : mousePoint.x,
						y : mousePoint.y
				});
			}
			break;
			
		case KWENTE.drawing2D.sketch.prototype.DRAWING_MODE_LINE:
			if( eventType == 'pointer' && eventName == 'up' ){
				if( ! this.drawingMode_soFar.tempLine ){
					// TODO change the point to a line for async drawing
					this.drawingMode_soFar.tempLine = new KWENTE.drawing2D.shapes.line({ points:[ {
							x : mousePoint.x,
							y : mousePoint.y
					}, {}] });
				}else{
					this.drawingMode_soFar.tempLine.points[1] = new KWENTE.drawing2D.shapes.point({
							x : mousePoint.x,
							y : mousePoint.y
					});
					
					this.addGeometry( this.drawingMode_soFar.tempLine );
					
					this.drawingMode_soFar.tempLine = new KWENTE.drawing2D.shapes.line({ points:[ {
							x : mousePoint.x,
							y : mousePoint.y
						}, {}] });
				}
			}
			if( eventType == 'pointer' && eventName == 'move' && this.drawingMode_soFar.tempLine ){
				this.drawingMode_soFar.tempLine.points[1] = new KWENTE.drawing2D.shapes.point({
						x : mousePoint.x,
						y : mousePoint.y
				});
			}
			//console.log( 'line', eventType, eventName, '??');
			break;
			
		default:
			console.log( 'default? not sure what to do', this.drawingMode, eventType, eventName, fuiState );
			return;
			break;
	}
	
};

KWENTE.drawing2D.sketch.prototype.getAllPointsList = function(){
	var ptList = [];
	for(var n in this.geometryList){
		
		//console.log( 'item', n, this.geometryList[n] );
		
		if( this.geometryList[n].x ){
			ptList.push({
				pt: {
					x : this.geometryList[n].x,
					y : this.geometryList[n].y,
					z : this.geometryList[n].z
				},
				geometry : this.geometryList[n]
			});
		}else if(this.geometryList[n].points){
			for(var i=0; i<this.geometryList[n].points.length;i++){
				ptList.push({
					pt: {
						x : this.geometryList[n].points[i].x,
						y : this.geometryList[n].points[i].y,
						z : this.geometryList[n].points[i].z
					},
					geometry : this.geometryList[n]
				});
			}
		}
	}
	
	return ptList;
};

KWENTE.drawing2D.sketch.prototype.closestPoint = function( pnt ){
	var candidates = this.getAllPointsList();
	for( var i=0; i < candidates.length; i++ ){
		//candidates[i].dist = Math.sqrt( (i.x-candidates[i].x)*(i.x-candidates[i].x) + (i.y-candidates[i].y)*(i.y-candidates[i].y) + (i.z||0-candidates[i].z||0)*(i.z||0-candidates[i].z||0) );
		var dx = pnt.x - candidates[i].pt.x;
		var dy = pnt.y - candidates[i].pt.y;
		var dz = 0;
		candidates[i].dist2 = dx*dx + dy*dy + dz*dz;
		// needed?
		//candidates[i].dist = Math.sqrt( candidates[i].dist2 );
	}
	candidates.sort(function(a,b){ return a.dist2 - b.dist2; });
	//console.log( 'candidates', candidates );
	// return the closest
	return candidates.shift();
};


// ---------- ../src\components\KWENTE.fui.js ---------- //
/*
 * KWENTE.fui namespace
 */

/*
 * F(Ph)ysical User Interface ;-)
 * being the mouse, keyboard, and TODO touches
 * TODO support touches/touchscreens
 */
KWENTE.fui = function(options){
	this.states = {
			mouse : {
				left	: false,
				right	: false,
				middle	: false,
				//TODO auxA, auxB, etc (add as activated?)
				position : {
					x : null,
					y : null
				}
			},
			keyboard : {
				ctrl	: false,
				shift	: false,
				alt		: false,
				meta	: false,
				
				was		: {}
			}
	};
	
	this.options = 	KWENTE.ensureDefaults( options, {
		disableContextMenu : true,
		debug : 10
	});
	
	this.registeredEvents = {
		pointer : {
			up		: [],
			down	: [],
			move	: [],
			scroll	: []
		},
		button : {
			up		: [],
			down	: []
		}
	};
	
	this.basePoints = {};
	
	this.lastKeyDown = null;
	
	
	this.init();
};

KWENTE.fui.prototype.init = function(options){
	this.attachListeners();
};

KWENTE.fui.prototype.attachListeners = function(){
	
	// retain scope
	var that = this;
	
	// TODO check for event.timestamp here to increase accuracy
	document.body.addEventListener( 'mousedown', function(event){that.__listener_mouse_down(event);}, false );
	document.body.addEventListener( 'mouseup',   function(event){that.__listener_mouse_up(event);}, false );
	document.body.addEventListener( 'mousemove', function(event){that.__listener_mouse_move(event);}, false );
	
	document.body.addEventListener( 'mousewheel',     function(event){that.__listener_mouse_scroll(event);}, false );
	document.body.addEventListener( 'DOMMouseScroll', function(event){that.__listener_mouse_scroll(event);}, false );
	
	//TODO determine if document is needed, or if there's a way to get events to fire when its desiredElement
	document.addEventListener( 'keydown',  function(event){that.__listener_key_down(event);},  false );
	document.addEventListener( 'keyup',    function(event){that.__listener_key_up(event);},    false );
	// for keypress, see http://www.quirksmode.org/dom/events/keys.html 
	
	this.options.disableContextMenu = this.options.disableContextMenu || false;
	if( this.options.disableContextMenu ){
		document.oncontextmenu = function(e){
			if (e && e.stopPropagation)
				e.stopPropagation();
			return false;
		};
	}
	
	// schedule the mousemove
	// TODO allow for coordination with requestAnimationFrame for better rendering
	this.options.moveTimer = this.options.moveTimer || 250;
	//this.__mousemoveTimer = setInterval(function(){that.listener_mouse_move_fire();}, this.options.moveTimer);
	//TODO enable changing the interval
	
};

KWENTE.fui.prototype.__listener_mouse_down = function(event){
	this.__commonHandler_modifierKeys(event);
	this.__commonHandler_mouseButton(event, true);
	this.__commonHandler_mousePosition(event);
	// TODO
	this.options.debug && this.options.debug <= 2 && console.log( "mouse down", event, this.states.mouse );
	this.callEvents( 'pointer', 'down' );
};

KWENTE.fui.prototype.__listener_mouse_up = function(event){
	this.__commonHandler_modifierKeys(event);
	this.__commonHandler_mouseButton(event, false);
	this.__commonHandler_mousePosition(event);
	// TODO
	this.options.debug && this.options.debug <= 2 && console.log( "mouse up", event, this.states.mouse );
	
	//console.log( this.states.mouse.position, {x:event.clientX, y:event.clientY} );
	
	this.callEvents( 'pointer', 'up' );
};

KWENTE.fui.prototype.__listener_mouse_move = function(event){
	this.__commonHandler_modifierKeys(event);
	this.__commonHandler_mousePosition(event);
	// TODO
	//console.log( "mouse move", event, this.states.mouse );
	this.callEvents( 'pointer', 'move' ); //TODO to be fired elsewhere
};

KWENTE.fui.prototype.__listener_mouse_scroll = function(event){
	this.__commonHandler_modifierKeys(event);
	// TODO
	this.options.debug && this.options.debug <= 2 && console.log( "mouse scroll", event, this.states.mouse );
	// put the direction into the dz location
	this.states.mouse.dz = -1 * Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
	this.callEvents( 'pointer', 'scroll' );
	this.states.mouse.dz = 0;
};

KWENTE.fui.prototype.__listener_key_down = function(event){
	// prevent duplicate down fires for the same key
	if( this.lastKeyDown == event.which )
		return false;
	this.lastKeyDown = event.which;
	//TODO maybe have a 'still down' event?
	
	this.__commonHandler_modifierKeys(event);
	this.__commonHandler_keyIdentification( event, 'down' );
	// TODO
	this.options.debug && this.options.debug <= 2 && console.log( "key down", event, this.states.keyboard );
	this.callEvents( 'button', 'down' );
};

KWENTE.fui.prototype.__listener_key_up = function(event){
	// clear the checker if its the same key (or bug of not detecting the next down)
	if( this.lastKeyDown == event.which )
		this.lastKeyDown = null;
	
	this.__commonHandler_modifierKeys(event);
	this.__commonHandler_keyIdentification( event, 'up' );
	// TODO
	this.options.debug && this.options.debug <= 2 && console.log( "key up", event, this.states.keyboard );
	this.callEvents( 'button', 'up' );
};


KWENTE.fui.prototype.__commonHandler_modifierKeys = function(event){
	// ctrl shift alt meta
	this.states.keyboard.ctrl	= event.ctrlKey  != undefined ? event.ctrlKey  : this.states.keyboard.ctrl;
	this.states.keyboard.shift	= event.shiftKey != undefined ? event.shiftKey : this.states.keyboard.shift;
	this.states.keyboard.alt	= event.altKey   != undefined ? event.altKey   : this.states.keyboard.alt;
	this.states.keyboard.meta	= event.metaKey  != undefined ? event.metaKey  : this.states.keyboard.meta;
};

KWENTE.fui.prototype.__commonHandler_mouseButton = function(event, state){
	//console.log('__commonHandler_mouseButton',event.which, event.button, event.buttons);
	// event.buttons is a bitmask method of buttons
	// event.which is left = 1
	// event.button is left = 0
	
	// Chrome does not have event.buttons
	// Firefox has all three
	var btn = null;
	switch(event.which){
		case 1:
			btn = 'left';
			break;
		case 2:
			btn = 'middle';
			break;
		case 3:
			btn = 'right';
			break;
		default:
			btn = 'aux'+event.which;
			break;
	}
	this.states.mouse[btn] = state;
};

KWENTE.fui.prototype.__commonHandler_mousePosition = function(event){
	this.states.mouse.position.x = event.clientX;
	this.states.mouse.position.y = event.clientY;
	//TODO
};

KWENTE.fui.prototype.__commonHandler_keyIdentification = function(event, eventName){
	if( KWENTE.fui_button_table[event.which] ){
		if( 'up' == eventName )
			this.states.keyboard.was[ KWENTE.fui_button_table[event.which] ] = this.states.keyboard[ KWENTE.fui_button_table[event.which] ];
		this.states.keyboard[ KWENTE.fui_button_table[event.which] ] = eventName == 'down' ? event.timestamp || Date.now() : undefined;//null; //something turns this to an {} ...drawing? :'(
	}else{
		console.error( 'key pressed that is not in the translation table!!!', event.which, event );
	}
};

KWENTE.fui.prototype.registerEvent = function( fuiType, eventName, func ){
	if( ! fuiType&&eventName&&func ){
		console.error( "must supply all arguments to register an event,", fuiType, eventName, func );
		return false;
	}
	
	if( typeof func != 'function' ){
		console.error( "func must be a function,", func );
		return false;
	}
	
	if( ! this.registeredEvents[fuiType] ){
		console.warn( "fuiType not recognized (expected 'pointer' or 'button'),", fuiType );
		this.registeredEvents[fuiType] = {};
	}
	
	if( ! this.registeredEvents[fuiType][eventName] || (this.registeredEvents[fuiType][eventName].constructor !== Array().constructor) ){
		console.warn( "eventName not recognized or new fuiType,", eventName );
		this.registeredEvents[fuiType][eventName] = [];
	}
	
	// return the index of the function (positive integer)
	return this.registeredEvents[fuiType][eventName].push( func ) - 1;
};

KWENTE.fui.prototype.callEvents = function( fuiType, eventName){
	var eventStack = this.registeredEvents[fuiType] && this.registeredEvents[fuiType][eventName];
	if( ! eventStack ){
		console.error( "unknown event types attempted to be called,", fuiType, eventName );
		return false;
	}
	var eventsFired = 0;
	for( var i = 0; i < eventStack.length; i++ ){
		eventStack[i]( this.states, this );
		eventsFired++;
	}
	
	//TODO change the mouse.was to enable state change info
	this.states.mouse.was = {};
	this.states.keyboard.was = {};
	
	return eventsFired;
};

KWENTE.fui.prototype.requestBasePoint = function(){
	var newIndex = null;
	do{
		newIndex = parseInt(1e8*Math.random());
	}while( this.basePoints[newIndex] );
	
	this.basePoints[newIndex] = {
			x : this.states.mouse.position.x,
			y : this.states.mouse.position.y
	};
	
	return newIndex;
};

KWENTE.fui.prototype.releaseBasePoint = function( index ){
	this.basePoints[index] = undefined;
};

KWENTE.fui.prototype.getBasePoint = function( index ){
	if( ! this.basePoints[index] ){
		console.error( "invalid base point index", index );
		return false;
	}
	
	return this.basePoints[index];
};

KWENTE.fui.prototype.basePointMovement = function( index ){
	if( ! this.basePoints[index] ){
		console.error( "invalid base point index", index );
		return false;
	}
	
	//*
	return {
		x : this.states.mouse.position.x - this.basePoints[index].x,
		y : this.states.mouse.position.y - this.basePoints[index].y
	};//*/
	
	var from = {
		x : this.basePoints[index].x,
		y : this.basePoints[index].y
	};
	
	var to = {
		x : this.states.mouse.position.x,
		y : this.states.mouse.position.y
	};
	
	var toReturn = {
	/*
		x : this.states.mouse.position.x - this.basePoints[index].x,
		y : this.states.mouse.position.y - this.basePoints[index].y
	//*/
		x : to.x - from.x,
		y : to.y - from.y
	};
	
	console.log( 'basePointMovement from', from, 'to', to, 'is', toReturn );
	
	return toReturn;
};













// based on https://github.com/AmicableNinja/FUI
KWENTE.fui_buttons = {
//** Based on Unicode values **//
//Thses values are NOT exclusive to each button, ex: US keyboards have ! and 1 on the same button, using the SHIFT modifier
//browsers only report the key, not the symbol, so relying on these to be exclusive is (currently) incorrect
//TODO allow character listening? Preliminary: No, even Chrome (which reports keyIdentifier in form U+0031) does not differentiate the character based on modifier keys
//Controls, not on keybds 0x0000 - 0x0007
	BACKSPACE              :     0x0008,  // There is an important distinction between Backspace and Delete in keyboards, C0, C1, and UTF namespaces.
                                            // While UTF names are used to avoid confusion on the application level, the UTF values are NOT the same as in the others
                                            // see the notes in the driver section and http://en.wikipedia.org/wiki/Delete_character
	TAB                    :     0x0009,  // CHAR. TABULATION
	ENTER                  :     0x000D,  // CARRIAGE RETURN (CR)
	SHIFT                  :     0x000F,  // SHIFT_IN
	CONTROL                :     0x0011,  // DEVICE CONTROL ONE
	ALT                    :     0x0012,  // DEVICE CONTROL TWO
	ESCAPE                 :     0x001B,  // ESCAPE 
	SPACE                  :     0x0020,  // SPACE
//EXCLAMATION MARK                   21
//QUOTATION MARK                     22
//NUMBER SIGN                        23
//DOLLAR SIGN                        24
//PERCENT SIGN                       25
//AMPERSAND                          26
	APOSTROPHE             :     0x0027,
//LEFT PARENTHESIS                   28
//RIGHT PARENTHESIS                  29
	ASTERISK               :     0x002A, // on NUMPAD
	PLUS_SIGN              :     0x002B, // on NUMPAD
	COMMA                  :     0x002C,
	HYPHEN_MINUS           :     0x002D, // HYPHEN-MINUS but use an underscore instead
	FULL_STOP              :     0x002E, // Period
		PERIOD : 	0x002E, //TODO allow common, but non-UTF names?
	SOLIDUS                :     0x002F,	SLASH : 0x002F, FORWARD_SLASH : 0x002F, //TODO allow common, but non-UTF names?

//TODO allow common, but non-UTF names?
	DIGIT_ZERO             :     0x0030, 0 : 0x0030,
	DIGIT_ONE              :     0x0031, 1 : 0x0031,
	DIGIT_TWO              :     0x0032, 2 : 0x0032,
	DIGIT_THREE            :     0x0033, 3 : 0x0033,
	DIGIT_FOUR             :     0x0034, 4 : 0x0034,
	DIGIT_FIVE             :     0x0035, 5 : 0x0035,
	DIGIT_SIX              :     0x0036, 6 : 0x0036,
	DIGIT_SEVEN            :     0x0037, 7 : 0x0037,
	DIGIT_EIGHT            :     0x0038, 8 : 0x0038,
	DIGIT_NINE             :     0x0039, 9 : 0x0039,

//COLON                    :     0x003A
	SEMICOLON              :     0x003B,
//LESS-THAN SIGN           :     0x003C
	EQUALS_SIGN            :     0x003D,
		EQUALS : 	0x003D, //TODO allow common, but non-UTF names?
//GREATER-THAN SIGN        :     0x003E
//QUESTION MARK            :     0x003F
//COMMERCIAL AT            :     0x0040
	
//TODO allow common, but non-UTF names?
	LATIN_CAPITAL_LETTER_A :     0x0041, A :     0x0041,
	LATIN_CAPITAL_LETTER_B :     0x0042, B :     0x0042,
	LATIN_CAPITAL_LETTER_C :     0x0043, C :     0x0043,
	LATIN_CAPITAL_LETTER_D :     0x0044, D :     0x0044,
	LATIN_CAPITAL_LETTER_E :     0x0045, E :     0x0045,
	LATIN_CAPITAL_LETTER_F :     0x0046, F :     0x0046,
	LATIN_CAPITAL_LETTER_G :     0x0047, G :     0x0047,
	LATIN_CAPITAL_LETTER_H :     0x0048, H :     0x0048,
	LATIN_CAPITAL_LETTER_I :     0x0049, I :     0x0049,
	LATIN_CAPITAL_LETTER_J :     0x004A, J :     0x004A,
	LATIN_CAPITAL_LETTER_K :     0x004B, K :     0x004B,
	LATIN_CAPITAL_LETTER_L :     0x004C, L :     0x004C,
	LATIN_CAPITAL_LETTER_M :     0x004D, M :     0x004D,
	LATIN_CAPITAL_LETTER_N :     0x004E, N :     0x004E,
	LATIN_CAPITAL_LETTER_O :     0x004F, O :     0x004F,
	LATIN_CAPITAL_LETTER_P :     0x0050, P :     0x0050,
	LATIN_CAPITAL_LETTER_Q :     0x0051, Q :     0x0051,
	LATIN_CAPITAL_LETTER_R :     0x0052, R :     0x0052,
	LATIN_CAPITAL_LETTER_S :     0x0053, S :     0x0053,
	LATIN_CAPITAL_LETTER_T :     0x0054, T :     0x0054,
	LATIN_CAPITAL_LETTER_U :     0x0055, U :     0x0055,
	LATIN_CAPITAL_LETTER_V :     0x0056, V :     0x0056,
	LATIN_CAPITAL_LETTER_W :     0x0057, W :     0x0057,
	LATIN_CAPITAL_LETTER_X :     0x0058, X :     0x0058,
	LATIN_CAPITAL_LETTER_Y :     0x0059, Y :     0x0059,
	LATIN_CAPITAL_LETTER_Z :     0x005A, Z :     0x005A,

	LEFT_SQUARE_BRACKET    :     0x005B,
	REVERSE_SOLIDUS        :     0x005C, BACKSLASH : 0x005C, //TODO allow common, but non-UTF names?
	RIGHT_SQUARE_BRACKET   :     0x005D,
//CIRCUMFLEX ACCENT (carrot)         5E
//LOW LINE (underscore)              5F
	GRAVE_ACCENT           :     0x0060, // The ` char Hint: MySQL
//LATIN SMALL LETTER A through Z  61-7A
//LEFT CURLY BRACKET                 7B
//VERTICAL LINE (pipe)               7C
//RIGHT CURLY BRACKET                7D
//TILDE                              7E
	DELETE                 :     0x007F,  // see note above for BACKSPACE (U+0008)
//NOT the EURO!! that is 20AC        80  // see http://blogs.msdn.com/b/michkap/archive/2005/10/26/484481.aspx

//TODO add other standard UTF characters found on keyboards (oh, to have a non us-en board...ebay? ,)




//** Buttons Extended Block (those not inside Unicode) **//
//arbitrarily chosen, any suggestions for better order?
//TODO maybe keep the physical declarations, coupled with the extended range bit? might get confusing (non-sequential) 'course, NOT using those values might get confusing :P
	F1                     :    0x10001,
	F2                     :    0x10002,
	F3                     :    0x10003,
	F4                     :    0x10004,
	F5                     :    0x10005,
	F6                     :    0x10006,
	F7                     :    0x10007,
	F8                     :    0x10008,
	F9                     :    0x10009,
	F10                    :    0x1000A,
	F11                    :    0x1000B,
	F12                    :    0x1000C,
	F13                    :    0x1000D,
	F14                    :    0x1000E,
	F15                    :    0x1000F,
	F16                    :    0x10010,
	F17                    :    0x10011,
	F18                    :    0x10012,
	F19                    :    0x10013,
	F20                    :    0x10014,
	F21                    :    0x10015,
	F22                    :    0x10016,
	F23                    :    0x10017,
	F24                    :    0x10018,

	PAUSE_BREAK            :    0x10019,
	CAPS_LOCK              :    0x1001A,
	PAGE_UP                :    0x1001B,
	PAGE_DOWN              :    0x1001C,
	END                    :    0x1001D,
	HOME                   :    0x1001E,
	ARROW_LEFT             :    0x1001F,
	ARROW_UP               :    0x10020,
	ARROW_RIGHT            :    0x10021,
	ARROW_DOWN             :    0x10022,
	PRINT_SCREEN           :    0x10023,
	INSERT                 :    0x10024,
	OS                     :    0x10026,
	CONTEXT_MENU           :    0x10027,
	NUMBER_LOCK            :    0x10028,
	SCROLL_LOCK            :    0x10029,
	HELP                   :    0x1002A,  // Probably pointless, likely intercepted before reaching webpage
	SELECT                 :    0x1002B,  // ahh, days of yore
	EXECUTE                :    0x1002C,  // what  happy  lore
	CLEAR                  :    0x1002D,
	SEPARATOR              :    0x1002e
};


// see https://github.com/AmicableNinja/FUI/blob/master/src/driver_s/keyboard/FUI.driver.keyboard.js
// and https://github.com/AmicableNinja/FUI/blob/master/src/driver_s/FUI.driver.js
// this is condensed based on that research
KWENTE.fui_button_table = {
		//0x01 : KWENTE.fui_buttons.,
		//0x02 : KWENTE.fui_buttons.,
		0x03 : KWENTE.fui_buttons.PAUSE_BREAK,
		//0x04 : KWENTE.fui_buttons.,
		//0x05 : KWENTE.fui_buttons.,
		//0x06 : KWENTE.fui_buttons.,
		0x08 : KWENTE.fui_buttons.BACKSPACE,
		0x09 : KWENTE.fui_buttons.TAB,
		0x0C : KWENTE.fui_buttons.CLEAR,
		0x0D : KWENTE.fui_buttons.ENTER,
		0x10 : KWENTE.fui_buttons.SHIFT,
		0x11 : KWENTE.fui_buttons.CONTROL,
		0x12 : KWENTE.fui_buttons.CONTEXT_MENU,
		0x13 : KWENTE.fui_buttons.PAUSE_BREAK,
		0x14 : KWENTE.fui_buttons.CAPS_LOCK,
		//0x15 : KWENTE.fui_buttons.,
		//BUTTON_HANGUEL : KWENTE.fui_buttons.,
		//BUTTON_HANGUL : KWENTE.fui_buttons.,
		//BUTTON_JUNJA : KWENTE.fui_buttons.,
		//BUTTON_FINAL : KWENTE.fui_buttons.,
		//BUTTON_HANJA : KWENTE.fui_buttons.,
		//BUTTON_KANJI : KWENTE.fui_buttons.,
		0x1B : KWENTE.fui_buttons.ESCAPE,
		//BUTTON_CONVERT : KWENTE.fui_buttons.,
		//BUTTON_NONCONVERT : KWENTE.fui_buttons.,
		//BUTTON_ACCEPT : KWENTE.fui_buttons.,
		//BUTTON_MODECHANGE : KWENTE.fui_buttons.,
		0x20 : KWENTE.fui_buttons.SPACE,
		0x21 : KWENTE.fui_buttons.PAGE_UP,
		0x22 : KWENTE.fui_buttons.PAGE_DOWN,
		0x23 : KWENTE.fui_buttons.END,
		0x24 : KWENTE.fui_buttons.HOME,
		0x25 : KWENTE.fui_buttons.ARROW_LEFT,
		0x26 : KWENTE.fui_buttons.ARROW_UP,
		0x27 : KWENTE.fui_buttons.ARROW_RIGHT,
		0x28 : KWENTE.fui_buttons.ARROW_DOWN,
		0x29 : KWENTE.fui_buttons.SELECT,
		//BUTTON_PRINT : KWENTE.fui_buttons., //?
		0x2B : KWENTE.fui_buttons.EXECUTE,
		0x2C : KWENTE.fui_buttons.PRINT_SCREEN,
		0x2D : KWENTE.fui_buttons.INSERT,
		0x2E : KWENTE.fui_buttons.DELETE,
		0x2F : KWENTE.fui_buttons.HELP,
		0x30 : KWENTE.fui_buttons.DIGIT_ZERO,
		0x31 : KWENTE.fui_buttons.DIGIT_ONE,
		0x32 : KWENTE.fui_buttons.DIGIT_TWO,
		0x33 : KWENTE.fui_buttons.DIGIT_THREE,
		0x34 : KWENTE.fui_buttons.DIGIT_FOUR,
		0x35 : KWENTE.fui_buttons.DIGIT_FIVE,
		0x36 : KWENTE.fui_buttons.DIGIT_SIX,
		0x37 : KWENTE.fui_buttons.DIGIT_SEVEN,
		0x38 : KWENTE.fui_buttons.DIGIT_EIGHT,
		0x39 : KWENTE.fui_buttons.DIGIT_NINE,
		0x41 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_A,
		0x42 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_B,
		0x43 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_C,
		0x44 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_D,
		0x45 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_E,
		0x46 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_F,
		0x47 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_G,
		0x48 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_H,
		0x49 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_I,
		0x4A : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_J,
		0x4B : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_K,
		0x4C : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_L,
		0x4D : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_M,
		0x4E : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_N,
		0x4F : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_O,
		0x50 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_P,
		0x51 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_Q,
		0x52 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_R,
		0x53 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_S,
		0x54 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_T,
		0x55 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_U,
		0x56 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_V,
		0x57 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_W,
		0x58 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_X,
		0x59 : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_Y,
		0x5A : KWENTE.fui_buttons.LATIN_CAPITAL_LETTER_Z,
		0x5B : KWENTE.fui_buttons.OS, // LWIN
		0x5C : KWENTE.fui_buttons.OS, // RWIN
		//BUTTON_APPS : KWENTE.fui_buttons.,
		//BUTTON_SLEEP : KWENTE.fui_buttons.,
		0x60 : KWENTE.fui_buttons.NUMPAD_0,
		0x61 : KWENTE.fui_buttons.NUMPAD_1,
		0x62 : KWENTE.fui_buttons.NUMPAD_2,
		0x63 : KWENTE.fui_buttons.NUMPAD_3,
		0x64 : KWENTE.fui_buttons.NUMPAD_4,
		0x65 : KWENTE.fui_buttons.NUMPAD_5,
		0x66 : KWENTE.fui_buttons.NUMPAD_6,
		0x67 : KWENTE.fui_buttons.NUMPAD_7,
		0x68 : KWENTE.fui_buttons.NUMPAD_8,
		0x69 : KWENTE.fui_buttons.NUMPAD_9,
		0x6A : KWENTE.fui_buttons.NUMPAD_MULTIPLY,
		0x6B : KWENTE.fui_buttons.NUMPAD_ADD,
		0x6C : KWENTE.fui_buttons.SEPARATOR,
		0x6D : KWENTE.fui_buttons.NUMPAD_SUBTRACT,
		0x6E : KWENTE.fui_buttons.SEPARATOR,
		0x6F : KWENTE.fui_buttons.NUMPAD_DIVIDE,
		0x70 : KWENTE.fui_buttons.F1,
		0x71 : KWENTE.fui_buttons.F2,
		0x72 : KWENTE.fui_buttons.F3,
		0x73 : KWENTE.fui_buttons.F4,
		0x74 : KWENTE.fui_buttons.F5,
		0x75 : KWENTE.fui_buttons.F6,
		0x76 : KWENTE.fui_buttons.F7,
		0x77 : KWENTE.fui_buttons.F8,
		0x78 : KWENTE.fui_buttons.F9,
		0x79 : KWENTE.fui_buttons.F10,
		0x7A : KWENTE.fui_buttons.F11,
		0x7B : KWENTE.fui_buttons.F12,
		0x7C : KWENTE.fui_buttons.F13,
		0x7D : KWENTE.fui_buttons.F14,
		0x7E : KWENTE.fui_buttons.F15,
		0x7F : KWENTE.fui_buttons.F16,
		0x80 : KWENTE.fui_buttons.F17,
		0x81 : KWENTE.fui_buttons.F18,
		0x82 : KWENTE.fui_buttons.F19,
		0x83 : KWENTE.fui_buttons.F20,
		0x84 : KWENTE.fui_buttons.F21,
		0x85 : KWENTE.fui_buttons.F22,
		0x86 : KWENTE.fui_buttons.F23,
		0x87 : KWENTE.fui_buttons.F24,
		0x90 : KWENTE.fui_buttons.NUMBER_LOCK,
		0x91 : KWENTE.fui_buttons.SCROLL_LOCK,
		0xA0 : KWENTE.fui_buttons.SHIFT,
		0xA1 : KWENTE.fui_buttons.SHIFT,
		0xA2 : KWENTE.fui_buttons.CONTROL,
		0xA3 : KWENTE.fui_buttons.CONTROL,
		0xA4 : KWENTE.fui_buttons.CONTEXT_MENU,
		0xA5 : KWENTE.fui_buttons.CONTEXT_MENU,
		//BUTTON_BROWSER_BACK : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_FORWARD : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_REFRESH : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_STOP : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_SEARCH : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_FAVORITES : KWENTE.fui_buttons.,
		//BUTTON_BROWSER_HOME : KWENTE.fui_buttons.,
		//BUTTON_VOLUME_MUTE : KWENTE.fui_buttons.,
		//BUTTON_VOLUME_DOWN : KWENTE.fui_buttons.,
		//BUTTON_VOLUME_UP : KWENTE.fui_buttons.,
		//BUTTON_MEDIA_NEXT_TRACK : KWENTE.fui_buttons.,
		//BUTTON_MEDIA_PREV_TRACK : KWENTE.fui_buttons.,
		//BUTTON_MEDIA_STOP : KWENTE.fui_buttons.,
		//BUTTON_MEDIA_PLAY_PAUSE : KWENTE.fui_buttons.,
		//BUTTON_LAUNCH_MAIL : KWENTE.fui_buttons.,
		//BUTTON_LAUNCH_MEDIA_SELECT : KWENTE.fui_buttons.,
		//BUTTON_LAUNCH_APP1 : KWENTE.fui_buttons.,
		//BUTTON_LAUNCH_APP2 : KWENTE.fui_buttons.,
		//BUTTON_PROCESSKEY : KWENTE.fui_buttons.,
		//BUTTON_ATTN : KWENTE.fui_buttons.,
		//BUTTON_CRSEL : KWENTE.fui_buttons.,
		//BUTTON_EXSEL : KWENTE.fui_buttons.,
		//BUTTON_EREOF : KWENTE.fui_buttons.,
		//BUTTON_PLAY : KWENTE.fui_buttons.,
		//BUTTON_ZOOM : KWENTE.fui_buttons.,
		//BUTTON_NONAME : KWENTE.fui_buttons.,
		//BUTTON_PA1 : KWENTE.fui_buttons.,
		0xFE : KWENTE.fui_buttons.CLEAR,
		// for US keyboards, this is the most likely area for changes
		0xBB : KWENTE.fui_buttons.PLUS_SIGN,
		0xBC : KWENTE.fui_buttons.COMMA,
		0xBD : KWENTE.fui_buttons.HYPHEN_MINUS,
		0xBE : KWENTE.fui_buttons.PERIOD,
		// but mostly this section:
		0xBA : KWENTE.fui_buttons.SEMICOLON,
		0xBF : KWENTE.fui_buttons.SOLIDUS,
		0xC0 : KWENTE.fui_buttons.GRAVE_ACCENT,
		0xDB : KWENTE.fui_buttons.LEFT_SQUARE_BRACKET,
		0xDC : KWENTE.fui_buttons.REVERSE_SOLIDUS,
		0xDD : KWENTE.fui_buttons.RIGHT_SQUARE_BRACKET,
		0xDE : KWENTE.fui_buttons.APOSTROPHE,
		//BUTTON_OEM_8 : KWENTE.fui_buttons.,
		//BUTTON_OEM_102 : KWENTE.fui_buttons.,

		// add in extras not found otherwise
		// firefox
		0x3B : KWENTE.fui_buttons.SEMICOLON,
		0x3D : KWENTE.fui_buttons.EQUALS_SIGN,
		0xAD : KWENTE.fui_buttons.HYPHEN_MINUS, // BUTTON_VOLUME_MUTE odd


		// And define for all string values returned by WebKit (see https://trac.webkit.org/browser/trunk/Source/WebKit/chromium/src/WebInputEvent.cpp)
		// TODO kindof a redefinition of what lies above, perhaps instead translate from string to physical key and then proceed as normal?
		"Alt" : KWENTE.fui_buttons.ALT,
		"Control" : KWENTE.fui_buttons.CONTROL,
		"Shift" : KWENTE.fui_buttons.SHIFT,
		"CapsLock" : KWENTE.fui_buttons.CAPS_LOCK,
		"Win" : KWENTE.fui_buttons.OS,
		"Clear" : KWENTE.fui_buttons.CLEAR,
		"Down" : KWENTE.fui_buttons.ARROW_DOWN,
		"End" : KWENTE.fui_buttons.END,
		"Enter" : KWENTE.fui_buttons.ENTER,
		"Execute" : KWENTE.fui_buttons.EXECUTE,
		"F1" : KWENTE.fui_buttons.F1 ,
		"F2" : KWENTE.fui_buttons.F2 ,
		"F3" : KWENTE.fui_buttons.F3 ,
		"F4" : KWENTE.fui_buttons.F4 ,
		"F5" : KWENTE.fui_buttons.F5 ,
		"F6" : KWENTE.fui_buttons.F6 ,
		"F7" : KWENTE.fui_buttons.F7 ,
		"F8" : KWENTE.fui_buttons.F8 ,
		"F9" : KWENTE.fui_buttons.F9 ,
		"F10" : KWENTE.fui_buttons.F10,
		"F11" : KWENTE.fui_buttons.F11,
		"F12" : KWENTE.fui_buttons.F12,
		"F13" : KWENTE.fui_buttons.F13,
		"F14" : KWENTE.fui_buttons.F14,
		"F15" : KWENTE.fui_buttons.F15,
		"F16" : KWENTE.fui_buttons.F16,
		"F17" : KWENTE.fui_buttons.F17,
		"F18" : KWENTE.fui_buttons.F18,
		"F19" : KWENTE.fui_buttons.F19,
		"F20" : KWENTE.fui_buttons.F20,
		"F21" : KWENTE.fui_buttons.F21,
		"F22" : KWENTE.fui_buttons.F22,
		"F23" : KWENTE.fui_buttons.F23,
		"F24" : KWENTE.fui_buttons.F24,
		"Help" : KWENTE.fui_buttons.HELP,
		"Home" : KWENTE.fui_buttons.HOME,
		"Insert" : KWENTE.fui_buttons.INSERT,
		"Left" : KWENTE.fui_buttons.ARROW_LEFT,
		"PageDown" : KWENTE.fui_buttons.PAGE_DOWN,
		"PageUp" : KWENTE.fui_buttons.PAGE_UP,
		"Pause" : KWENTE.fui_buttons.PAUSE_BREAK,
		"PrintScreen" : KWENTE.fui_buttons.PRINT_SCREEN,
		"Right" : KWENTE.fui_buttons.ARROW_RIGHT,
		"Scroll" : KWENTE.fui_buttons.SCROLL_LOCK,
		"Select" : KWENTE.fui_buttons.SELECT,
		"Up" : KWENTE.fui_buttons.ARROW_UP,
		/* // not recognized as not reported by browsers tested
		"MediaNextTrack" : KWENTE.fui_buttons."MediaNextTrack",
		"MediaPreviousTrack" : KWENTE.fui_buttons."MediaPreviousTrack",
		"MediaStop" : KWENTE.fui_buttons."MediaStop",
		"MediaPlayPause" : KWENTE.fui_buttons."MediaPlayPause",
		"VolumeMute" : KWENTE.fui_buttons."VolumeMute",
		"VolumeDown" : KWENTE.fui_buttons."VolumeDown",
		"VolumeUp" : KWENTE.fui_buttons."VolumeUp",
		//*/
};


// ---------- ../src\components\KWENTE.scene.js ---------- //
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


// ---------- ../src\components\KWENTE.gui.js ---------- //
/*
 * KWENTE.gui namespace
 */

/*
 * Graphical User Interface ;-)
 * the DOM Adapter
 * TODO be cross-browser compliant
 */
KWENTE.gui = function(options){
	console.log( "created new gui :)" );
};


// ---------- ../src\components\drawing\KWENTE.drawing.shapes.js ---------- //
KWENTE.drawing2D.shapes = {};


// ---------- ../src\components\drawing\shapes\KWENTE.drawing.shapes.point.js ---------- //
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


// ---------- ../src\components\drawing\shapes\KWENTE.drawing.shapes.line.js ---------- //
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


