import _ from 'lodash';
import {RenderableUtils} from './RenderableUtils';
import {RenderableView} from './RenderableView';

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
        this.lines = null;

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
			let lastValue = null;
			let deltaValueSum = 0.0;

			let stats = {
				x: {min: null, max: null},
				y: {min: null, max: null}
			};

			_.forEach(value.data, point => {
				if (lastValue === null) {
					lastValue = point[0] * 1.0;
					deltaValueSum += lastValue;
				} else {
					deltaValueSum += point[0] * 1.0 - lastValue;
					lastValue = point[0] * 1.0;
				}

				stats.x.min = Math.min(stats.x.min, point[0]);
				stats.x.max = Math.max(stats.x.max, point[0]);
				stats.y.min = Math.min(stats.y.min, point[1]);
				stats.y.max = Math.max(stats.y.max, point[1]);
			});

			stats.xAvgDelta = deltaValueSum / value.data.length;
			value.stats = stats;

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
        let thickness = this.options.thickness;

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
            
			this.line = RenderableUtils.CreateLineNative(normalized, value.color, thickness);
			this.add(this.line);
		});
    }
    
    _unitsPerPixelChanged() {
        if (this.options.unitsPerPixel < 0.1) {
			this.options.unitsPerPixel = 0.1;
		}

		this.empty();
		this.vRangeCache = null;
        this._createGeometry();
    }
    
    /**
     * Adds given delta to unitsPerPixel and recreates the geometry.
     * @param {number} delta 
     */
	addUnitsPerPixel(delta) {
		this.options.unitsPerPixel += delta;
        this._unitsPerPixelChanged();
    }
    
    /**
     * Sets the units per pixel and recreates the geometry.
     * @param {number} unitsPerPixel The new units per pixel.
     */
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

    /**
     * Sets the visible range of the dataset using a range inside [0, 1].
     * @param {number} rangeMin Value in the [0, 1] range for the left side.
     * @param {number} rangeMax Value in the [0, 1] range for the right side.
     */
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
		this.vRangeCache = null;
		
		if (this.options.zoom) {
            // set the vertical scaling for current visible values
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
			for (let index = minIndex; index < maxIndex + 1; index++) {
				let v = value.data[index][1];
				minVisY = Math.min(minVisY, value.data[index][1]);
				maxVisY = Math.max(maxVisY, value.data[index][1]);
			}
		});

		this.vRangeCache = {
			x: {min: xmin, max: xmax},
			y: {min: minVisY, max: maxVisY}
		};

		return this.vRangeCache;
	}
}

export {Dataset};
