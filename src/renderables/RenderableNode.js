import THREE from 'three';
import {EventNode} from '../EventNode';
import {RenderableUtils} from "./RenderableUtils";


class RenderableNode extends EventNode
{
	constructor(options)
	{
		super();
		this._id = Math.floor((1 + Math.random()) * 0xFFFFFFFF);
		this._renderables = {};

		this._scene = new THREE.Scene();
		if (options.backgroundColor !== undefined) {
			this._scene.background = options.backgroundColor;
		}

		this._parent = null;
		if (options.view !== null) {
			this._createCamera(options);
		}
	}

	add(node)
	{
		if (node instanceof RenderableNode) {
			this._scene.add(node.renderable);
			this._renderableAdded(node);
		} else {
			this._scene.add(node);
			this._object3dAdded(node);
		}
	}

	remove(node)
	{
		if (node instanceof RenderableNode) {
			this._scene.remove(node.renderable);
			this._renderableRemoved(node);
		} else {
			this._scene.remove(node);
			this._object3dRemoved(node);
		}
	}

	render(renderer)
	{
		renderer.render(this._scene, this.camera);
	}

	get renderable()
	{
		return this._scene;
	}

	_renderableAdded(node)
	{
		this._renderables[node._id] = node;
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
		this._renderables[node._id] = null;
		node._parent = null;
		node.emit('parentRemoved', this, node);
	}

	_object3dRemoved(node)
	{
		this.emit('childRemoved', this, node);
	}

	_createCamera(options)
	{
		if (options.orthographic) {
			let left = size.x / -2, right = size.x / 2,
				top = size.y / 2, bottom = size.y / -2,
				near = 1, far = 100;
			this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
		} else {
			let aspect = this.options.size.x / this.options.size.y;
			this.camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 1000);
		}
	}
}

export {RenderableNode};