import _ from 'lodash';
import {RenderableNode} from "./RenderableNode";
import {Dataset} from './Dataset';


//todo: add support for 'added' event
class Axis extends RenderableNode
{
	constructor(options)
	{
		super();
		this._setupDefaultOptions(options);
		this.on('parentAdded', (parent, child) => { this._onParentAdded(parent, child); });
	}

	_setupDefaultOptions(options)
	{
		let requiredOptions = ['name'];
		RenderableUtils.AssertRequiredFields(options, requiredOptions, 'Axis.options');

		this.options = _.cloneDeep(options);
	}

	_onParentAdded(parent, child)
	{
		if (!parent instanceof Dataset) {
			throw 'Error: Parent of Axis not of type Dataset';
		}

	}
}

export {Axis};