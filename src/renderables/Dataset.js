import _ from 'lodash';
import {RenderableUtils} from './RenderableUtils';
import {RenderableView} from './RenderableView';
import {RMMQHelper} from './RMMQ';

class Dataset extends RenderableView {
	constructor(options) {
		super(options); 

		let requiredOptions = ['values'];
		let defaultOptions = {
            unitsPerPixel: 1,
            thickness: 0.5,
            zoom: false
		};

		this.options = RenderableUtils.CreateOptions(
			options,
			requiredOptions,
			'Dataset.options',
			defaultOptions
		);
		
		this.vRangeCache = null;
        this.lines = {};

		// data used for the current track position line
		this._currentPos = null;
		this._currentPositionLine = null;
        
		this._calcStats();
		this._assertColors();
		this._createGeometry();

		this.on('resize', () => this._createGeometry());
	}

	_calcStats() {
		let globalStats = {
			x: {min: Number.MAX_VALUE, max: Number.MIN_VALUE},
			y: {min: Number.MAX_VALUE, max: Number.MIN_VALUE}
		};

		_.forEach(this.options.values, value => {
            // create the rmmq helper with the getter for the way the dataset
            // is setup. If the structure of the incoming data changes, this 
            // getter should change too. 
			let rmmqHelperX = new RMMQHelper(value.data, (arr, i) => arr[i][0]);
			let rmmqHelperY = new RMMQHelper(value.data, (arr, i) => arr[i][1]);
            
            // Precomputation of ranges. We only do this once and reused, where
            // the computation gains come from.
            rmmqHelperX.precomputeRMMQ();
            rmmqHelperY.precomputeRMMQ();
            
			let stats = value.stats = {
				x: {
					min: rmmqHelperX.min(0, value.data.length - 1),
					max: rmmqHelperX.max(0, value.data.length - 1)
				},
				y: {
					min: rmmqHelperY.min(0, value.data.length - 1),
					max: rmmqHelperY.max(0, value.data.length - 1)
				}
			};

			value.stats.x.rmmqHelper = rmmqHelperX;
			value.stats.y.rmmqHelper = rmmqHelperY;
			
			globalStats.x.min = Math.min(stats.x.min, globalStats.x.min);
			globalStats.x.max = Math.max(stats.x.max, globalStats.x.max);
			globalStats.y.min = Math.min(stats.y.min, globalStats.y.min);
			globalStats.y.max = Math.max(stats.y.max, globalStats.y.max);
		});

		this.options.stats = globalStats;
	}

	_assertColors() {
		_.forEach(this.options.values, (val) => {
			// create random color of not assigned
			if (_.isNil(val.color)) {
				val.color = Math.floor(Math.random() * 0xFFFFFF);
			}
		});
    }
    
	_createGeometry() {
		let viewSize = this.viewSize;

		// TODO: add support for the thickness option (how this did happen?!?!)
        let thickness = this.options.thickness;

		// iterate the provided datasets to normalize and
		// create the geometry from that
		_.forEach(this.options.values, value => {
			let normalized = [];
            let maxValue = value.stats.y.max;
			let minValue = value.stats.y.min;
			
			_.forEach(value.data, point => {
                // scale x axis by unitsPerPixel
                let x = point[0] / this.options.unitsPerPixel;
                
                // normalize y axis to values inside [0, 1]
                let y = (point[1] - minValue) / (maxValue - minValue);
                
                // scale y axis based on padding
                let padding = 0.2;
                y *= viewSize.y * (1.0 - padding);

                // translate y to center of rendering area based on padding
                y += (viewSize.y * (padding / 2.0));

				normalized.push([x, y]);
			});

			let line = RenderableUtils.CreateLineNative(normalized, value.color, thickness);
			this.add(line);
			this.lines[value.name] = {geometry: line, status: true};
		});

		// create the track position line from floor of rendering aread to 
		// the top of it
		let trackVerts = [[0, 0], [0, viewSize.y]];
		this._currentPositionLine = RenderableUtils.CreateLineNative(trackVerts, new THREE.Color(0xFF0000));
		this._currentPositionLine.position.z = 1;
		this.add(this._currentPositionLine);
    }
    
    _unitsPerPixelChanged() {
        if (this.options.unitsPerPixel < 0.1) {
			this.options.unitsPerPixel = 0.1;
		}

		this.empty();
		this.vRangeCache = null;
        this._createGeometry();
    }
    
	addUnitsPerPixel(delta) {
		this.options.unitsPerPixel += delta;
        this._unitsPerPixelChanged();
    }
    
    setUnitsPerPixel(unitsPerPixel) {
		this.options.unitsPerPixel = unitsPerPixel;
        this._unitsPerPixelChanged();
    }

    dataMinMaxForRange(rangeMin, rangeMax) {
        // calculate delta of the complete dataset
		let stats = this.options.stats;
        let rootDelta = stats.x.max - stats.x.min;

		// calculate min and max of x axis to be shown
		let dataMin = stats.x.min + rangeMin * rootDelta;
        let dataMax = stats.x.min + rangeMax * rootDelta;

        return {dataMin, dataMax};
    }

	setVisibleRange(rangeMin, rangeMax) {
        // data range based on rangeMin and rangeMax
		let {dataMin, dataMax} = this.dataMinMaxForRange(rangeMin, rangeMax);

        // calculate range of data based on unitsPerPixel
        let unitsPerPixel = this.options.unitsPerPixel;
        let delta = dataMax - dataMin;
        let pixelRange = delta / unitsPerPixel;

        // calculate new camera's x position
        let newCameraX = dataMin / unitsPerPixel;

        // set the new values and rerender the scene
        this.setCameraPosition(newCameraX);
        this.setCameraXRange(pixelRange);
        
        // Note: setting vRangeCache to null makes the lazy loading 
        // to kick in and recalculate the min max for the visible range.
		this.vRangeCache = null;
        
        // set the vertical scaling for current visible values
        if (this.options.zoom) {
            let visibleRange = this.visibleRange;
            let valueDelta = visibleRange.y.max - visibleRange.y.min;
            let valuePercentage = valueDelta / (this.options.stats.y.max - this.options.stats.y.min);
            this._camera.zoom = 1 / valuePercentage;
            this._camera.updateProjectionMatrix();
        }
	}
	
	get visibleRange() {
		if (this.vRangeCache !== null) {
			return this.vRangeCache;
		}

		// calculate min and max x axis visible
		let xmin = this._camera.position.x * this.options.unitsPerPixel;
        let xmax = xmin + (this._camera.right * 
            this.options.unitsPerPixel * this._camera.scale.x);
		
		// get indexes for the x values calculated
        let getFunc = (arr, index) => arr[index][0];
        let values = this.options.values[0].data;
        let binSearch = RenderableUtils.BinarySearch;
		
		let minIndex;
		if (xmin < this.options.stats.x.min) {
			minIndex = 0;
		} else {
			minIndex = binSearch(values, xmin, true, getFunc);
		}

		let maxIndex;
		if (xmax > this.options.stats.x.max) {
			maxIndex = values.length - 1;
		} else {
			maxIndex = binSearch(values, xmax, false, getFunc);
		}
		
		// calc max and min y values
		let maxVisY = Number.MIN_VALUE;
		let minVisY = Number.MAX_VALUE;

		_.forEach(this.options.values, value => {
			minVisY = Math.min(minVisY, value.stats.x.rmmqHelper.min(minIndex, maxIndex));
			maxVisY = Math.max(maxVisY, value.stats.y.rmmqHelper.max(minIndex, maxIndex));
		});

		this.vRangeCache = {
			x: {min: xmin, max: xmax},
			y: {min: minVisY, max: maxVisY}
		};

		return this.vRangeCache;
	}

	setCurrentPosition(position) {
		this._currentPosition = position;
        this._currentPositionLine.position.x = position;
        
        if (this._isFollowing) {
            // get the min and max of the graph in world coordinates
            let graph_range = this.options.stats.x;

            // get half of the center of the screen
            let half_range = (this.visibleRange.x.max - this.visibleRange.x.min);
            half_range *= 0.5;
            
            // if the distance between the current position and the end of 
            // the graph is less than half the screen then we're at the end 
            // of the graph. Just assert that the current position line is 
            // visible.
            if (position < half_range) {
                this.assert_line_shown();
                return;
            }
            
            // if the distance between the current position and the end of 
            // the graph is less than half the screen then we're at the end 
            // of the graph. Just assert that the current position line is 
            // visible.
            if ((graph_range.max - position) < half_range) {
                this.assert_line_shown();
                return;
            }

            // if the distance between the current position and the end of 
            // the graph is less than half the screen then we're at the end 
            // of the graph. Just assert that the current position line is 
            // visible. If the current position + half the screen is less 
            // than the end of the graph then we just move the camera such 
            // that the current position line is at the center of the screen.
            if ((position + half_range) < graph_range.max) {
                this.center_camera();
                return;
            }
        }
    }

    /**
     * @private
     * Sets the camera's x position such that the current position line sits 
     * at the center of the renderable area. This method doesn't verify if 
     * the current position is past the bounds of the graph. 
     */
    center_camera() {
        // calculate half_screen in world coords
        let stats = this.options.stats;
        let unitsPerPixel = this.options.unitsPerPixel;
        let viewWidthInUnits = this.viewSize.x * unitsPerPixel;

        // check whether at ends or at the center of the graph
        let atStart = (this._currentPosition - stats.x.min) < viewWidthInUnits;
        let atEnd = (stats.x.max - this._currentPosition) < viewWidthInUnits;
        
        // calculate min and max x axis visible
		let xmin = this._camera.position.x * this.options.unitsPerPixel;
        let xmax = xmin + (this._camera.right * 
            this.options.unitsPerPixel * this._camera.scale.x);
        let statsDelta = stats.x.max - stats.x.min;
        let xminNormalized = (xmin - stats.x.min) / statsDelta;
        let xmaxNormalized = (xmax - stats.x.min) / statsDelta;
        let currentCoverage = xmaxNormalized - xminNormalized;

        // if at endpoints, move the most possible to to that side.
        if (atStart) {
            this.setVisibleRange(0, currentCoverage);
            return;
        }

        if (atEnd) {
            this.setVisibleRange(1 - currentCoverage, 1);
            return;
        }

        // move the camera with the same zoom but with the current position 
        // line in the middle. 
        let currentPositionNormalized = (this._currentPosition - stats.x.min) / statsDelta;
        let halfCurrentCoverage = currentCoverage / 2;
        this.setVisibleRange(currentPositionNormalized - halfCurrentCoverage, currentPositionNormalized + halfCurrentCoverage);
    }

    /**
     * @private
     * This make sure that the line is shown if it can be shown. This is done
     * when the playing starts without the line in the visible area of the 
     * screen.
     */
    assert_line_shown() {

        // if the line is already visible, do nothing and return
        let greaterThanMin = this._currentPosition > this.visibleRange.x.min;
        let lessThanMax = this._currentPosition < this.visibleRange.x.max;
        if (greaterThanMin && lessThanMax) return;

        // TODO: correctly check if current position is able to be shown with current zoom
        let graph_range = this.options.stats.x;
        let ableToShow = this._currentPosition > graph_range.min &&
            this._currentPosition < graph_range.max;
        
        // if able, just center camera and return
        if (ableToShow) {
            this.center_camera();
        }
    }
    
    subsetStatus(name, value) {
        // if name not given or not found, return null
        if (_.isNil(name)) return null;
        if (!_.has(this.lines, name)) return null;

        // if only name given, return current subset status
        if (_.isNil(value)) return this.lines[name].status;
        
        // cache the given status
        this.lines[name].status = value;

        // add/remove the geometry from the scene based on the new value
        if (value) {
            this._scene.add(this.lines[name].geometry);
        } else {
            this._scene.remove(this.lines[name].geometry);
        }
    }

    set isFollowing(value) {
        this._isFollowing = value;
    }
}

export {Dataset};
