import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableNode} from "./RenderableNode";

class Dataset extends RenderableNode
{
	constructor(options)
	{
		super(options);

		let requiredOptions = ['data'];
		let defaultOptions = {
			name: null,
			color: 0x000000,
			unit: 1,
		};

		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options', defaultOptions);

		this.stats = {
			xBounds: { min: null, max: null },
			yBounds: { min: null, max: null }
		};

		this._calcStats();
		this._createNormalizedData(30);
		this._createGeometry();
	}

	_calcStats()
	{
		/**
		 * todo: check if this algo suffers from overflow problems
		 */
		let lastValue = null;
		let	deltaValueSum = 0.0;

		_.forEach(this.options.data, (point) => {

			if (lastValue === null) {
				lastValue = point[0] * 1.0;
				deltaValueSum += lastValue;
			} else {
				deltaValueSum += (point[0] * 1.0) - lastValue;
				lastValue = point[0] * 1.0;
			}

			this.stats.xBounds.min = Math.min(this.stats.xBounds.min, point[0]);
			this.stats.xBounds.max = Math.max(this.stats.xBounds.max, point[0]);
			this.stats.yBounds.min = Math.min(this.stats.yBounds.min, point[1]);
			this.stats.yBounds.max = Math.max(this.stats.yBounds.max, point[1]);
		});

		this.stats.xAvgDelta = deltaValueSum / this.options.data.length;
	}

	_createNormalizedData()
	{
		this.normalizedData = [];
		let maxValue = this.stats.yBounds.max;
		_.forEach(this.options.data, (value) => {
			this.normalizedData.push([value[0] / this.options.unit, value[1] / maxValue]);
		});
	}

	_createGeometry()
	{
		// we assume only one line is child of our group
		let unit = this.options.unit, maxY = this.stats.yBounds.max;
		let transformFunc = (point) => [point[0], point[1] * maxY];
		this.line = RenderableUtils.CreateLine(this.normalizedData.map(transformFunc), this.options.color);
		this.add(this.line);
	}

	setScale(scale)
	{
		this.remove(this.line);
		this.line = null;
		this._createGeometry(scale);
	}
}

export {Dataset}