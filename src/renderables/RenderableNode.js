import THREE from 'three';
import {EventNode} from '../EventNode';
import {RenderableUtils} from "./RenderableUtils";


class RenderableNode extends EventNode {
	constructor(options) {
		super();

		let required = ['view', 'size'],
			defaultOptions = {backgroundColor: null};

		this.options = RenderableUtils.CreateOptions(options, required, 'RenderableNode.options', defaultOptions);

		this._id = Math.floor((1 + Math.random()) * 0xFFFFFFFF);
		this._renderables = {};
		this._scene = new THREE.Scene();
		this._parent = null;

		if (options.backgroundColor !== null) {
			this._scene.background = options.backgroundColor;
		}

		this._createCamera();
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

	updateView(size) {
		if (!(size instanceof THREE.Vector2)) {
			throw 'Error: size not of type THREE.Vector2';
		}

		this.options.size = size;
	}

	render(renderer) {
		let size = this.options.size,
			view = this.options.view;

		let left = Math.floor(size.x * view.left),
			top = Math.floor(size.y * view.top),
			width = Math.floor(size.x * view.width),
			height = Math.floor(size.y * view.height);

		renderer.setViewport(left, top, width, height);
		renderer.setScissor(left, top, width, height);
		renderer.setScissorTest(true);

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		renderer.render(this._scene, this._camera);
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

	_createCamera() {
		let left = 0, right = 100,
			top = 100, bottom = 0,
			near = 0, far = 1;

		let camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);

		camera.up.set(0, 1, 0);
		camera.position.set(0, 0, 1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		camera.updateProjectionMatrix();

		this._camera = camera;
	}

	moveCamera(delta)
	{
		this._camera.position.x += delta;
		if (this._camera.position.x < 0) {
			this._camera.position.x = 0;
		}
	}

	zoomCamera(delta)
	{
		this._camera.scale.x += delta;
		if (this._camera.scale.x < 1.0) {
			this._camera.scale.x = 1.0;
		}
	}
}

export {RenderableNode};