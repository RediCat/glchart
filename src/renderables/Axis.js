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
		// vertical axis line
		let verticalGridPoints = [
			[1, 0],
			[1, 10]
		];
		let verticalGrid = RenderableUtils.CreateLine(verticalGridPoints, this.options.color, 2);
		this.add(verticalGrid);

		// todo: draw the minimum 2 endpoints on top and bottom.
	}
}

export {Axis};