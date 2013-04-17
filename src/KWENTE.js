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