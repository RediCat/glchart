import THREE from 'three';
import {EventNode} from '../EventNode';


class RenderableNode extends EventNode
{
	constructor()
	{
		super();
		this._group = new THREE.Group();
		this._parent = null;
	}

	add(node)
	{
		if (node instanceof RenderableNode) {
			this._group.add(node.renderable);
			node._parent = this;
			this.emit('parentAdded', this, node);
		} else {
			this._group.add(node);
		}
		this.emit('childAdded', this, node);
	}

	remove(node)
	{
		if (node instanceof RenderableNode) {
			this._group.remove(node.renderable);
			node._parent = null;
			node.emit('parentRemoved', this, node);
		} else {
			this._group.remove(node);
		}
		this.emit('childRemoved', this, node);
	}

	get renderable()
	{
		return this._group;
	}
}

export {RenderableNode};