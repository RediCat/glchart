import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableNode} from "./RenderableNode";

class Dataset extends RenderableNode
{
	constructor(options)
	{
		super();
		this._setupDefaultOptions(options);

		this.stats = {
			xBounds: { min: null, max: null },
			yBounds: { min: null, max: null }
		};

		this._calcStats();
		this._createNormalizeData();
		this._createGeometry();
	}

	_setupDefaultOptions(options)
	{
		let requiredOptions = ['data'];
		let defaultOptions = {
			name: null,
			color: 0x000000
		};
		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options', defaultOptions);
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
		console.log(this.stats);
	}

	_createNormalizeData()
	{
		this.normalizedData = [];
		let maxValue = this.stats.yBounds.max;
		_.forEach(this.options.data, (value) => {
			this.normalizedData.push([value[0], value[1] / maxValue]);
		});
	}

	_createGeometry(scale)
	{
		if (scale === undefined) {
			scale = 1;
		}

		// we assume only one line is child of our group
		let transformFunc = (point) => [point[0] * scale, point[1] * this.stats.yBounds.max];
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