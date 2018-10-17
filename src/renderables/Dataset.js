import _ from 'lodash';
import {RenderableUtils} from './RenderableUtils';
import {RenderableView} from './RenderableView';

class Dataset extends RenderableView {
	constructor(options) {
		super(options);

		let requiredOptions = ['values'];
		let defaultOptions = {
            unitsPerPixel: 1,
            thickness: 0.2
		};

		this.options = RenderableUtils.CreateOptions(
			options,
			requiredOptions,
			'Dataset.options',
			defaultOptions
		);

		this._calcStats();
		this._createGeometry();
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
				xBounds: {min: null, max: null},
				yBounds: {min: null, max: null}
			};

			_.forEach(value.data, point => {
				if (lastValue === null) {
					lastValue = point[0] * 1.0;
					deltaValueSum += lastValue;
				} else {
					deltaValueSum += point[0] * 1.0 - lastValue;
					lastValue = point[0] * 1.0;
				}

				stats.xBounds.min = Math.min(stats.xBounds.min, point[0]);
				stats.xBounds.max = Math.max(stats.xBounds.max, point[0]);
				stats.yBounds.min = Math.min(stats.yBounds.min, point[1]);
				stats.yBounds.max = Math.max(stats.yBounds.max, point[1]);
			});

			stats.xAvgDelta = deltaValueSum / value.data.length;
			value.stats = stats;

			globalStats.x.min = Math.min(stats.xBounds.min, globalStats.x.min);
			globalStats.x.max = Math.max(stats.xBounds.max, globalStats.x.max);
			globalStats.y.min = Math.min(stats.yBounds.min, globalStats.y.min);
			globalStats.y.max = Math.max(stats.yBounds.max, globalStats.y.max);
		});

		this.options.stats = globalStats;
	}

	_createGeometry() {
        let viewSize = this.viewSize;
        let thickness = this.options.thickness;

		_.forEach(this.options.values, value => {
			let normalized = [];
            let maxValue = value.stats.yBounds.max;
            
			_.forEach(value.data, point => {
                // scale x axis by unitsPerPixel
                let x = point[0] / this.options.unitsPerPixel;
                
                // normalize y axis to values inside [0, 1]
                let y = point[1] / maxValue;
                
                // scale y axis based on padding
                let padding = 0.2;
                y *= viewSize.y * (1.0 - padding);

                // translate y to center of rendering area based on padding
                y += (viewSize.y * (padding / 2.0));

				normalized.push([x, y]);
			});
            
			let line = RenderableUtils.CreateLine(normalized, value.color, thickness);
			this.add(line);
		});
    }
    
    _unitsPerPixelChanged() {
        if (this.options.unitsPerPixel < 0.1) {
			this.options.unitsPerPixel = 0.1;
		}

        this.empty();
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
        this.setCameraRange(pixelRange);

        // adjust y axis
        this.adjustVerticalAxisForRange(rangeMin, rangeMax);
	}

    adjustVerticalAxisForRange(rangeMin, rangeMax) {
        // data range based on rangeMin and rangeMax
        let {dataMin, dataMax} = this.dataMinMaxForRange(rangeMin, rangeMax);

        // get indexes for the x values calculated
        let getFunc = (arr, index) => arr[index][0];
        let values = this.options.values[0].data;
        let binSearch = RenderableUtils.BinarySearch;
        let minIndex = binSearch(values, dataMin, true, getFunc);
        let maxIndex = binSearch(values, dataMax, false, getFunc);

        console.log(`minIndex = ${minIndex} maxIndex = ${maxIndex}`)
    }

	get visibleRange() {
        let xmin = this._camera.position.x * this.options.unitsPerPixel;
        let xmax = xmin + (this._camera.right * 
            this.options.unitsPerPixel * this._camera.scale.x);

		return {
			x: {min: xmin, max: xmax},
			y: this.options.stats.y
		};
	}
}

export {Dataset};
