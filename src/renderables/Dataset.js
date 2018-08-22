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

		this._createGeometry();
	}

	_setupDefaultOptions(options)
	{
		let requiredOptions = ['data'];
		let defaultOptions = {
			color: 0x000000
		};
		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options', defaultOptions);
	}

	_createGeometry()
	{
		_.forEach(this.data, (point) => {
			this.stats.xBounds.min = Math.min(this.stats.xBounds.min, point.x);
			this.stats.xBounds.max = Math.max(this.stats.xBounds.max, point.x);
			this.stats.yBounds.min = Math.min(this.stats.yBounds.min, point.y);
			this.stats.yBounds.max = Math.max(this.stats.yBounds.max, point.y);
		});

		this.line = RenderableUtils.CreateLine(this.data, this.options.color);
		this.add(this.line);
	}
}

export {Dataset}