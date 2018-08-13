import THREE from 'three';
import _ from 'lodash';

class Axis
{
	constructor(options)
	{
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