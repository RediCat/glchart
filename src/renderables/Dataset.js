import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableView} from "./RenderableView";

class Dataset extends RenderableView
{
	constructor(options)
	{
		super(options);

		let requiredOptions = ['values'];
		let defaultOptions = {
			unitPerPixel: 1,
		};

		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options', defaultOptions);

		this._calcStats();
		this._createGeometry();
	}

	_calcStats()
	{
		/**
		 * todo: check if this algo suffers from overflow problems
		 */
		_.forEach(this.options.values, (value) => {
			let lastValue = null;
			let	deltaValueSum = 0.0;

			let stats = {
				xBounds: { min: null, max: null },
				yBounds: { min: null, max: null }
			};

			_.forEach(value.data, (point) => {
				if (lastValue === null) {
					lastValue = point[0] * 1.0;
					deltaValueSum += lastValue;
				} else {
					deltaValueSum += (point[0] * 1.0) - lastValue;
					lastValue = point[0] * 1.0;
				}

				stats.xBounds.min = Math.min(stats.xBounds.min, point[0]);
				stats.xBounds.max = Math.max(stats.xBounds.max, point[0]);
				stats.yBounds.min = Math.min(stats.yBounds.min, point[1]);
				stats.yBounds.max = Math.max(stats.yBounds.max, point[1]);
			});

			stats.xAvgDelta = deltaValueSum / value.data.length;
			value.stats = stats;
		});
	}

	_createGeometry()
	{
		_.forEach(this.options.values, (value) => {
			let normalized = [];
			let maxValue = value.stats.yBounds.max;
			_.forEach(value.data, (point) => {
				normalized.push([point[0] / this.options.unitPerPixel, (point[1] / maxValue) * 80 + 10]);
			});

			let line = RenderableUtils.CreateLine(normalized, value.color, 0.5);
			this.add(line);
		});
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

		this._createGeometry();
	}
}

export {Dataset}