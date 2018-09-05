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
		let defaultOptions = {
			size: new THREE.Vector2(400, 200),
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			orthographic: true,
			fontColor: 0x000000,
			title: '',
			parentElement: ''
		};

		let options = RenderableUtils.CreateOptions(globalOptions.chart, null, 'options.chart', defaultOptions);

		if (!options.backgroundColor instanceof THREE.Color) {
			options.backgroundColor = new THREE.Color(_defaultBackgroundColor);
			Console.warn('Chart.options.backgroundColor is not of type THREE.Color, using default.')
		}

		super({
			view: null,
			backgroundColor: options.backgroundColor,
			size: options.size,
		});

		this._datasets = {};

		// todo: make this views reactive.
		this.views = {
			title: {
				left: 0,
				top: 0,
				width: 1.0,
				height: 0.15,
			},
			graph: {
				left: 0.1,
				top: 0.15,
				width: 0.9,
				height: 0.6,
			},
			xAxis: {
				left: 0.1,
				top: 0.75,
				width: 0.9,
				height: 0.25,
			},
			yAxis: {
				left: 0,
				top: 0.15,
				width: 0.1,
				height: 0.6,
			},
		};

		this._allowRendering = false;
		this.globals = globalOptions;
		this.options = options;

		this._createFontFactory().then(() => {
			this._createRenderer();
			this._setupGestures();

			//this._createTitleView();
			//this._createAxisView();
			this._createGraphViews();

			this._allowRendering = true;
			this.render();
			this.emit('load');

			// let testText = this._fontFactory.create('lato', 'Random Data', 0x0000ff);
			// this.add(testText);
		});
	}

	_createRenderer()
	{
		// Search for the parentElement, if selector specified
		let parentElement = null;
		if (this.options.parentElement !== '') {
			parentElement = document.querySelector(this.options.parentElement);
		}

		if (parentElement !== null) {
			// Create canvas element with configured size.
			let canvasElem = document.createElement('canvas');
			canvasElem.width = this.options.size.x;
			canvasElem.height = this.options.size.y;

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

		this.renderer.setSize(this.options.size.x, this.options.size.y, true);
		this.renderer.setPixelRatio(this.options.pixelRatio);
		this.domElement = this.renderer.domElement;
	}

	_createAxisView()
	{

		this._xAxis = new Axis(_.merge(this.globals.axis.x, this.views.xAxis));
		this._yAxis = new Axis(_.merge(this.globals.axis.y, this.views.yAxis));
	}

	_createGraphViews()
	{
		_.forEach(this.globals.datasets, (datasetOptions) => {
			let datasetOpts = _.merge(datasetOptions, {
				view: this.views.graph,
				size: this.options.size,
				backgroundColor: this.options.backgroundColor,
				orthographic: this.options.orthographic,
			});

			let dataset = new Dataset(datasetOpts);

			dataset.setScale(10);
			this._datasets[dataset._id] = dataset;
		});
	}

	_createTitleView()
	{

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
	// 	this.control = new THREE.OrbitControls(this._camera, this.renderer.domElement);
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
		_.forEach(this._datasets, (dataset) => {
			dataset._camera.position.x -= ev.deltaX * 0.1;
		});
		this._render();
	}

	_render()
	{
		if (!this._allowRendering) {
			return;
		}
		this.render();
	}

	render()
	{
		//this._xAxis.render(this.renderer);
		//this._yAxis.render(this.renderer);

		_.forEach(this._datasets, (dataset) => {
			dataset.render(this.renderer);
		});
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
}

export {Chart};