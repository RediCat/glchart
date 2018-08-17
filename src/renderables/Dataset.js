import THREE from 'three';
import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";

class Dataset
{
	constructor(options)
	{
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
		this.options = RenderableUtils.CreateOptions(options, requiredOptions, 'Dataset.options');
	}

	_createGeometry()
	{
		let geometry = new THREE.Geometry();
		_.forEach(this.data, (point) => {
			this.stats.xBounds.min = Math.min(this.stats.xBounds.min, point.x);
			this.stats.xBounds.max = Math.max(this.stats.xBounds.max, point.x);
			this.stats.yBounds.min = Math.min(this.stats.yBounds.min, point.y);
			this.stats.yBounds.max = Math.max(this.stats.yBounds.max, point.y);
			geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
		});

		let material = new THREE.LineBasicMaterial({
			color: 0x0000ff,
			side: THREE.DoubleSide,
		});

		this.line = new THREE.Line(geometry, material);
		this.renderable = new THREE.Object3D();
		this.renderable.add(this.line);
	}
}

export {Dataset}