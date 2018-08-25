import {RenderableNode} from "./RenderableNode";
import {RenderableUtils} from "./RenderableUtils";
import {Dataset} from './Dataset';

class Axis extends RenderableNode
{
	constructor(options)
	{
		super();
		this._setupDefaultOptions(options);
		this.on('parentAdded', (parent) => { this._onParentAdded(parent); });
		this.on('parentRemoved', (parent) => { this._onParentRemoved(parent); });
	}

	_setupDefaultOptions(options)
	{
		let defaultOptions = {
			stepCoefX: 10,
			stepCoefY: 10,
			xLabel: '',
			yLabel: '',
			lineColor: 0xAABBFF
		};
		this.options = RenderableUtils.CreateOptions(options, null, 'Axis.options', defaultOptions);
		this.stats = null;
	}

	_onParentAdded(parent)
	{
		if (!parent instanceof Dataset) {
			throw 'Error: Parent of Axis not of type Dataset';
		}

		this.stats = {
			stepSizeX: Math.floor(parent.stats.xBounds.max / this.options.stepCoefX),
			stepSizeY: Math.floor(parent.stats.yBounds.max / this.options.stepCoefX)
		};

		if (parent.stats.yBounds.min >= 0) {
			this._createSingleVerticalAxis(parent);
		} else {
			this._createFullVerticalAxis(parent);
		}
	}

	_onParentRemoved(parent)
	{
		if (!parent instanceof Dataset) {
			throw 'Error: Parent of Axis not of type Dataset';
		}

		this.stats = null;
	}

	_createSingleVerticalAxis(parent)
	{
		// x axis line
		let xAxisLineVerts = [
			[0, 0],
			[parent.stats.xBounds.max, 0]
		];
		let xAxisLine = RenderableUtils.CreateLine(xAxisLineVerts, this.options.color, 2);
		this.add(xAxisLine);

		// y axis line
		let yAxisLineVerts = [
			[0, 0],
			[0, parent.stats.yBounds.max + 20]
		];
		let yAxisLine = RenderableUtils.CreateLine(yAxisLineVerts, this.options.lineColor, 2);
		this.add(yAxisLine);
	}

	_createFullVerticalAxis(parent)
	{
	}
}

export {Axis};