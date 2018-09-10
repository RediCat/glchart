import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableView} from "./RenderableView";

class Dataset extends RenderableView
{
	constructor(options)
	{
		super(options);

		let requiredOptions = ['data'];
		let defaultOptions = {
			name: null,
			color: 0x000000,
			unitPerPixel: 1,
		};

		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options', defaultOptions);

		this.stats = {
			xBounds: { min: null, max: null },
			yBounds: { min: null, max: null }
		};

		this._calcStats();
		this._createNormalizedData();
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
			this.normalizedData.push([value[0] / this.options.unitPerPixel, value[1] / maxValue]);
		});
	}

	_createGeometry()
	{
		let transformFunc = (point) => [point[0], point[1] * 80 + 10];
		this.line = RenderableUtils.CreateLine(this.normalizedData.map(transformFunc), this.options.color, 0.5);
		this.add(this.line);
	}

	moveCamera(delta)
	{
		this._camera.position.x += delta;
		if (this._camera.position.x < 0) {
			this._camera.position.x = 0;
		}
	}

	zoomCamera(delta)
	{
		this.empty();
		this.options.unitPerPixel += delta * 0.01;

		if (this.options.unitPerPixel < 0.1) {
			this.options.unitPerPixel = 0.1;
		}

		this._createNormalizedData();
		this._createGeometry();
	}
}

export {Dataset}