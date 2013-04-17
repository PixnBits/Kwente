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