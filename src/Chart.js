import THREE from 'three';
import Hammer from 'hammerjs';
import {Axis} from './renderables/Axis';
import {Dataset} from "./renderables/Dataset";
import {FontFactory} from "./font/FontFactory";
import {RenderableUtils} from "./renderables/RenderableUtils";
import {RenderableNode} from "./renderables/RenderableNode";

const _defaultBackgroundColor = 0xffffff;

class Chart extends RenderableNode
{
	constructor(globalOptions)
	{
		super(true);
		this._allowRendering = false;
		this._globals = globalOptions;

		this._createFontFactory().then(() => {
			this._setupDefaultOptions();
			this._createScene();
			this._createRenderer();
			this._createCamera();
			this._setupGestures();
			this._createAxis();
			this._createDatasets();

			this._allowRendering = true;
			this.render();
			this.emit('load');

			let testText = this._fontFactory.create('lato', 'Random Data', 0x0000ff);
			this.add(testText);
		});
	}

	_setupDefaultOptions()
	{
		let defaultOptions = {
			size: new THREE.Vector2(400, 200),
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			orthographic: true,
			fontColor: 0x000000,
			title: '',
			parentElement: null
		};
		this.options = RenderableUtils.CreateOptions(this._globals.charf, null, 'options.chart', defaultOptions);

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

	_createCamera()
	{
		let size = this.options.size;

		if (this.options.orthographic) {
			let left = size.x / -2, right = size.x / 2,
				top = size.y / 2, bottom = size.y / -2,
				near = 1, far = 100;
			this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
		} else {
			let aspect = this.options.size.x / this.options.size.y;
			this.camera = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 1000);
		}

		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera.position.add(new THREE.Vector3(size.x / 2, size.y / 2));
		this.camera.updateProjectionMatrix();
	}

	_createAxis()
	{
		this._axis = new Axis(this._globals.axis);
		this.add(this._axis);
	}

	_createDatasets()
	{
		_.forEach(this._globals.datasets, (datasetOptions) => {
			let dataset = new Dataset(datasetOptions);
			this.add(dataset);
		});
	}

	_createFontFactory()
	{
		return new Promise((resolve, reject) => {
			this._fontFactory = new FontFactory();
			this._fontFactory.loadFonts()
				.catch((err) => reject(err))
				.then(() => {resolve()});
		});
	}

	// _setupDevEnvironment()
	// {
	// 	this.control = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	// 	this.axesHelper = new THREE.AxesHelper(5);
	// 	this._scene.add(this.axesHelper);
	// 	this._animate();
	// }

	_animate()
	{
		requestAnimationFrame(() => this._animate());
		this.control.update();
		this._render();
	}

	_setupGestures()
	{
		this.hammer = new Hammer(this.domElement);
		this.hammer.on('panright panleft', (ev) => this._hammerPanHandler(ev));
	}

	_hammerPanHandler(ev)
	{
		this.camera.position.x -= ev.deltaX * 0.1;
		this._render();
	}

	_render()
	{
		if (!this._allowRendering) {
			return;
		}
		this.render();
	}

	add(node)
	{
		if (!(node instanceof RenderableNode)) {
			throw 'Error: chart.add called with parameter not of type RenderableNode';
		}
		this._scene.add(node.renderable);
		this._renderableAdded(node);
		this._render();
	}

	remove(node)
	{
		if (!node instanceof RenderableNode) {
			throw 'Error: chart.add called with parameter not of type RenderableNode';
		}
		this._scene.remove(node.renderable);
		this._renderableRemoved(node);
		this._render();
	}

	render()
	{
		this.renderer.render(this._scene, this.camera);
	}
}

export {Chart};