import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableNode} from "./RenderableNode";

class Dataset extends RenderableNode
{
	constructor(options)
	{
		super();
		this._setupDefaultOptions(options);

		this.data = this.options.data;
		this.stats = {
			xBounds: { min: null, max: null },
			yBounds: { min: null, max: null }
		};

		this._calcStats();
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
		_.forEach(this.data, (point) => {
			this.stats.xBounds.min = Math.min(this.stats.xBounds.min, point[0]);
			this.stats.xBounds.max = Math.max(this.stats.xBounds.max, point[0]);
			this.stats.yBounds.min = Math.min(this.stats.yBounds.min, point[1]);
			this.stats.yBounds.max = Math.max(this.stats.yBounds.max, point[1]);
		});
	}

	_createGeometry(scale)
	{
		let scaling = false;
		if (scale !== undefined) {
			scaling = true;
		}

		if (scaling) {
			if (scale === 1 && this.originalData !== undefined) {
				this.data = this.originalData;
				this.originalData = null;
			} else {
				this.originalData = this.data;
				let scaleFunc = (value) => [scale * value[0], value[1]];
				this.data = this.data.map(scaleFunc);
				console.log(this.data);
			}
		}

		// we assume only one line is child of our group
		this.line = RenderableUtils.CreateLine(this.data, this.options.color);
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