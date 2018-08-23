import THREE from 'three';
import Hammer from 'hammerjs';
import EventEmitter from 'events';
import {RenderableUtils} from "./renderables/RenderableUtils";
import {RenderableNode} from "./renderables/RenderableNode";

const _defaultBackgroundColor = 0xffffff;

class Chart
{
	constructor(options)
	{
        this._events = new EventEmitter();
		this._setupDefaultOptions(options);
		this._createScene();
		this._createRenderer();
		this._createCamera();

		this._setupGestures();
		//this._setupDevEnvironment();
	}

	/**
	 * Setups options defaults so no checking is needed in rest of the class.
	 * @param options The options passed through the constructor.
	 * @private
	 */
	_setupDefaultOptions(options)
	{
		let defaultOptions = {
			size: new THREE.Vector2(400, 200),
			cameraBounds: new THREE.Vector2(1, 100),
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			orthographic: true,
			parentElement: null
		};
		this.options = RenderableUtils.CreateOptions(options, null, 'Chart.options', defaultOptions);

		if (!this.options.backgroundColor instanceof THREE.Color) {
			this.options.backgroundColor = new THREE.Color(_defaultBackgroundColor);
			Console.warn('Chart.options.backgroundColor is not of type THREE.Color, using default.')
		}
	}

	_createScene()
	{
		this._scene = new THREE.Scene();
		this._scene.background = this.options.backgroundColor;
	}

	/**
	 * Creates the renderer.
	 * @private
	 */
	_createRenderer()
	{
		let parentElement;
		if (this.options.parentElement !== null &&
			(parentElement = document.querySelector(this.options.parentElement)) !== null) {

			let canvasElem = document.createElement('canvas');
			this.renderer = new THREE.WebGLRenderer({
				canvas: canvasElem,
				alpha: this.options.useAlpha,
				antialias: true
			});
			parentElement.appendChild(canvasElem);
		} else {
			this.renderer = new THREE.WebGLRenderer({
				alpha: this.options.useAlpha,
				antialias: true
			});
			document.body.appendChild(this.renderer.domElement);
		}

		this.renderer.setSize(this.options.size.x, this.options.size.y);
		this.renderer.setPixelRatio(this.options.pixelRatio);
		this.domElement = this.renderer.domElement;
	}

	/**
	 * Creates the orthographic camera.
	 * @private
	 */
	_createCamera()
	{
		let size = this.options.size,
			cameraBounds = this.options.cameraBounds;

		if (this.options.orthographic) {
			let left = size.x / -2, right = size.x / 2,
				top = size.y / 2, bottom = size.y / -2,
				near = cameraBounds.x, far = cameraBounds.y;
			this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
		} else {
			let aspect = this.options.size.x / this.options.size.y;
			this.camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 1000);
		}

		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}

	_setupDevEnvironment()
	{
		this.control = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.axesHelper = new THREE.AxesHelper(5);
		this._scene.add(this.axesHelper);
		this._animate();
	}

	_animate()
	{
		requestAnimationFrame(() => this._animate());
		this.control.update();
		this._render();
	}

	/**
	 * Setups Hammer.js gestures.
	 * @private
	 */
	_setupGestures()
	{
		this.hammer = new Hammer(this.domElement);
		this.hammer.on('panright panleft', (ev) => this._hammerPanHandler(ev));
	}

	/**
	 * Handles the panning event of Hammer.js
	 * @param ev The hammer.js event object.
	 * @private
	 */
	_hammerPanHandler(ev)
	{
		this.camera.position.x -= ev.deltaX * 0.1;
		this._render();
	}

	/**
	 * This stub is internally used to have a point of control where all
	 * calls to render are routed.
	 * @private
	 */
	_render()
	{
		this.render();
	}

	add(node)
	{
		if (!node instanceof RenderableNode) {
			throw 'Error: chart.add called with parameter not of type RenderableNode';
		}
		this._scene.add(node.renderable);
		this._render();
	}

	remove(node)
	{
		if (!node instanceof RenderableNode) {
			throw 'Error: chart.add called with parameter not of type RenderableNode';
		}
		this._scene.remove(node.renderable);
		this._render();
	}

	render()
	{
		this.renderer.render(this._scene, this.camera);
	}

	on(eventName, cb)
	{
		// If registering for load event, already loaded,
		// so call without registering.
		if (eventName === 'load') {
			cb(this);
			return this;
		}

		this._events.on(eventName, cb);
		return this;
	}
}

export {Chart};