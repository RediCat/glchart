import THREE from 'three';
import _ from 'lodash';
import Hammer from 'hammerjs';
import EventEmitter from 'events';
import {BitmapFont} from './renderables/BitmapFont.js';
import {Dataset} from './renderables/Dataset.js';
import {Axis} from './renderables/Axis.js';
import {RenderableNode} from "./renderables/RenderableNode";

const _defaultBackgroundColor = 0xffffff;

class Chart extends RenderableNode
{
	constructor(options)
	{
		super();
		this._datasets = [];
		this._axes = [];
		this._fonts = {};
        this._events = new EventEmitter();
		this._setupDefaultOptions(options);
		this._createRenderer();
		this._createCamera();

		//this._setupGestures();
		this._setupDevEnvironment();

		this._animate();
	}

	/**
	 * Setups options defaults so no checking is needed in rest of the class.
	 * @param options The options passed through the constructor.
	 * @private
	 */
	_setupDefaultOptions(options)
	{
		this.options = _.cloneDeep(options);
		this.options.size = _.get(options, 'size', new THREE.Vector2(400, 200));
		this.options.cameraBounds = _.get(options, 'cameraBounds', new THREE.Vector2(1, 100));
		this.options.pixelRatio = _.get(options, 'pixelRatio', window.devicePixelRatio);
        this.options.useAlpha = _.get(options, 'useAlpha', true);
        this.options.backgroundColor = _.get(options, 'backgroundColor', new THREE.Color(_defaultBackgroundColor));
        this.options.orthographic = _.get(options, 'orthographic', true);

		if (!this.options.backgroundColor instanceof THREE.Color) {
			this.options.backgroundColor = new THREE.Color(_defaultBackgroundColor);
			Console.warn('Chart.options.backgroundColor is not of type THREE.Color, using default.')
		}

		this.scene.background = this.options.backgroundColor;
	}

	/**
	 * Creates the renderer.
	 * @private
	 */
	_createRenderer()
	{
		this.renderer = new THREE.WebGLRenderer({
			alpha: this.options.useAlpha
		});

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
		this.scene.add(this.axesHelper);
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

	add(renderable)
	{
		super.add(renderable);
		if (renderable instanceof Dataset) {
			this._datasets.push(renderable);
		} else if (renderable instanceof BitmapFont) {
			this._fonts[renderable.name] = renderable;
		} else if (renderable instanceof Axis) {
			this._axes.push(renderable);
		} else {
			throw 'chart.add: Instance not of supported type.';
		}
		this._render();
	}

	render()
	{
		this.renderer.render(this.scene, this.camera);
	}

	on(eventName, cb)
	{
		// If registering for load event, already loaded,
		// so call without registering.
		if (eventName === 'load') {
			cb(this);
			return;
		}

		this._events.on(eventName, cb);
		return this;
	}
}

export {Chart};