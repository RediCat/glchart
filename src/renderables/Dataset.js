import THREE from 'three';
import _ from 'lodash';

class Dataset
{
	constructor(options)
	{
		if (!_.has(options, 'data')) {
			throw 'options.data was not defined.'
		}

		this.data = options.data;
		let geometry = new THREE.Geometry();
		_.forEach(this.data, (point) => {
			geometry.vertices.push(new THREE.Vector3(point.x, point.y, 0));
		});

		let material = new THREE.LineBasicMaterial({color: 0x0000ff});
		this.renderable = new THREE.Line(geometry, material);
	}
}

export {Dataset}