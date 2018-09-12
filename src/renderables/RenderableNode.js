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
		this._scene.add(node);
		this._renderables[node.uuid] = node;
	}

	remove(node) {
		this._scene.remove(node);
		let newRenderables = {};
		for (var id in this._renderables) {
			if (id !== node.uuid) {
				newRenderables[id] = this_.renderables[id];
			}
		}
		this._renderables = newRenderables;
	}

	empty(toDelete)
	{
		if (Array.isArray(toDelete)) {
			_.forEach(toDelete, (r) => {
				this._scene.remove(r);
				delete this._renderables[r.uuid];
			});

		} else {
			_.forEach(this._renderables, (r) => this._scene.remove(r));
			this._renderables = {};
		}
	}

	render(renderer, camera) {
		renderer.render(this._scene, camera);
	}
}

export {RenderableNode};