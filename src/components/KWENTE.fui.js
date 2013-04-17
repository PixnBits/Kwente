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