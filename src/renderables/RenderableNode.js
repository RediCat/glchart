import _ from 'lodash';
import THREE from 'three';

class RenderableNode {
	constructor()
	{
		this._nodes = [];
		this._renderables = [];
		this._scene = new THREE.Scene();
	}

	add(node)
	{
		this._nodes.push(node);
		if (_.has(node, 'renderable')) {
			this._renderables.push(node);
			this._scene.add(node.renderable);
		}
	}

	get scene()
	{
		return this._scene;
	}
}

export {RenderableNode};