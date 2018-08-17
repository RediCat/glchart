import THREE from 'three';
import EventEmitter from 'events';

//todo: add 'added' event support for Axis class
class RenderableNode {
	constructor()
	{
		this._group = new THREE.Group();
	}

	add(node)
	{
		if (node instanceof RenderableNode) {
			this._group.add(node.renderable);
		} else {
			this._group.add(node);
		}
	}

	remove(node)
	{
		if (node instanceof RenderableNode) {
			this._group.remove(node.renderable);
		} else {
			this._group.remove(node);
		}
	}

	get renderable()
	{
		return this._group;
	}
}

export {RenderableNode};