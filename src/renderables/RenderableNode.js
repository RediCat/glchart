import THREE from 'three';
import {EventNode} from '../EventNode';


class RenderableNode extends EventNode
{
	constructor(facade)
	{
		super();
		if (facade === true) {
			return;
		}
		this._group = new THREE.Group();
		this._parent = null;
	}

	add(node)
	{
		if (node instanceof RenderableNode) {
			this._group.add(node.renderable);
			this._renderableAdded(node);
		} else {
			this._group.add(node);
			this._object3dAdded(node);
		}
	}

	remove(node)
	{
		if (node instanceof RenderableNode) {
			this._group.remove(node.renderable);
			this._renderableRemoved(node);
		} else {
			this._group.remove(node);
			this._object3dRemoved(node);
		}
	}

	get renderable()
	{
		return this._group;
	}

	_renderableAdded(node)
	{
		node._parent = this;
		this.emit('parentAdded', this, node);
		this.emit('childAdded', this, node);
	}

	_object3dAdded(node)
	{
		this.emit('childAdded', this, node);
	}

	_renderableRemoved(node)
	{

		node._parent = null;
		node.emit('parentRemoved', this, node);
	}

	_object3dRemoved(node)
	{
		this.emit('childRemoved', this, node);
	}
}

export {RenderableNode};