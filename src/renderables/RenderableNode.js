import THREE from 'three';
import EventEmitter from 'events';

class RenderableNode
{
	constructor()
	{
		this._group = new THREE.Group();
		this._events = new EventEmitter();
	}

	add(node)
	{
		if (node instanceof RenderableNode) {
			this._group.add(node.renderable);
			node._events.emit('parentAdded', this, node);
		} else {
			this._group.add(node);
		}
		this._events.emit('childAdded', this, node);
	}

	remove(node)
	{
		if (node instanceof RenderableNode) {
			this._group.remove(node.renderable);
			node._events.emit('parentRemoved', this, node);
		} else {
			this._group.remove(node);
		}
		this._events.emit('childRemoved', this, node);
	}

	get renderable()
	{
		return this._group;
	}

	on(eventName, cb)
	{
		this._events.on(eventName, cb);
		return this;
	}

	emit(type, ...args)
	{
		this._events.emit(type, ...args);
	}
}

export {RenderableNode};