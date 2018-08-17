import _ from 'lodash';
import {RenderableNode} from "./RenderableNode";

//todo: add support for 'added' event
class Axis extends RenderableNode
{
	constructor(options)
	{
		super();
		this._setupDefaultOptions(options);
	}

	_setupDefaultOptions(options)
	{
		let requiredOptions = ['name'];
		RenderableUtils.AssertRequiredFields(options, requiredOptions, 'Axis.options');

		this.options = _.cloneDeep(options);
	}
}

export {Axis};