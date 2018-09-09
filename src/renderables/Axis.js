import {RenderableNode} from "./RenderableNode";
import {RenderableUtils} from "./RenderableUtils";
import {Dataset} from './Dataset';

class Axis extends RenderableNode
{
	// todo: make this a view controlled by data given and assumptions based on the layout
	// todo: create grid lines geometry without the range data
	constructor(options)
	{
		super(options);

		let defaultOptions = {
			label: '',
			lineColor: 0xAABBFF,
			vertical: true,
			steps: 2,
			thickness: 2,
		};
		this.options = RenderableUtils.CreateOptions(options, null, 'Axis.options', defaultOptions);
		this.stats = null;

		if (this.options.steps < 2) {
			this.options.steps = 2;
		}

		if (this.options.vertical) {
			this._createVerticalGrid();
		}
	}

	_createVerticalGrid()
	{
		let distanceToRight = 90;

		// vertical axis line
		let verticalGridPoints = [
			[100, 0],
			[100, 100]
		];
		let verticalGrid = RenderableUtils.CreateLine(verticalGridPoints, this.options.lineColor, this.options.thickness);
		this.add(verticalGrid);

		let topLinePoints = [
			[distanceToRight, 100],
			[100, 100],
		];
		let topLine = RenderableUtils.CreateLine(topLinePoints, this.options.lineColor, this.options.thickness);
		this.add(topLine);

		let bottomLinePoints = [
			[distanceToRight, 0],
			[100, 0],
		];
		let bottomLine = RenderableUtils.CreateLine(bottomLinePoints, this.options.lineColor, this.options.thickness);
		this.add(bottomLine);
	}
}

export {Axis};