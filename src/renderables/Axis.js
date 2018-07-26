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
		if (!_.has(options, 'name')) {
			throw 'options.name was not defined';
		}

		this.options = options;
	}
}