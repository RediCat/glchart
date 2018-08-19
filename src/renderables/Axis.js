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
		let requiredOptions = ['name'];
		let defaultOptions = {
			stepCoefX: 10,
			stepCoefY: 10
		};
		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Axis.options', defaultOptions);
		this.stats = null;
	}

	_onParentAdded(parent)
	{
		if (!parent instanceof Dataset) {
			throw 'Error: Parent of Axis not of type Dataset';
		}

		this.stats = {
			stepSizeX: Math.floor(parent.stats.xBounds.max/this.options.stepCoefX),
			stepSizeY: Math.floor(parent.stats.yBounds.max/this.options.stepCoefX)
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
		let geometry = new THREE.Geometry();
		// xaxis line
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(new THREE.Vector3(parent.stats.xBound.max, 0, 0));
	}

	_createFullVerticalAxis(parent)
	{

	}
}

export {Axis};