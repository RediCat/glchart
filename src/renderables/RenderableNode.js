import THREE from 'three';
import {EventNode} from '../EventNode';
import {RenderableUtils} from "./RenderableUtils";


class RenderableNode extends EventNode {
	constructor(options) {
		super();

		if (options === undefined || options === null) {
			options = {};
		}

		let defaultOptions = {
			backgroundColor: null
		};

		this.options = RenderableUtils.CreateOptions(options, null, 'RenderableNode.options', defaultOptions);

		this._id = Math.floor((1 + Math.random()) * 0xFFFFFFFF);
		this._renderables = {};
		this._scene = new THREE.Scene();
		this._parent = null;

		if (options.backgroundColor !== null) {
			this._scene.background = options.backgroundColor;
		}
	}

	add(node) {
		if (node instanceof RenderableNode) {
			this._scene.add(node.renderable);
			this._renderableAdded(node);
		} else {
			this._scene.add(node);
			this._object3dAdded(node);
		}
	}

	remove(node) {
		if (node instanceof RenderableNode) {
			this._scene.remove(node.renderable);
			this._renderableRemoved(node);
		} else {
			this._scene.remove(node);
			this._object3dRemoved(node);
		}
	}

	render(renderer, camera) {
		renderer.render(this._scene, camera);
	}

	_renderableAdded(node) {
		this._renderables[node._id] = node;
		node._parent = this;
		this.emit('parentAdded', this, node);
		this.emit('childAdded', this, node);
	}

	_object3dAdded(node) {
		this.emit('childAdded', this, node);
	}

	_renderableRemoved(node) {
		this._renderables[node._id] = null;
		node._parent = null;
		node.emit('parentRemoved', this, node);
	}

	_object3dRemoved(node) {
		this.emit('childRemoved', this, node);
	}
}

export {RenderableNode};