import THREE from 'three';
import Hammer from 'hammerjs';
import {Axis} from './renderables/Axis';
import {Dataset} from "./renderables/Dataset";
import {FontFactory} from "./font/FontFactory";
import {RenderableUtils} from "./renderables/RenderableUtils";
import {EventNode} from "./EventNode";

const _defaultBackgroundColor = 0xffffff;
const _minimumHeight = 200;
const _minimumHeightWarning = _.once(() => {
	console.warn(`Minimum height of ${_minimumHeight}px is not satisfied. Forcing to ${_minimumHeight}px.`);
});

class Chart extends EventNode
{
	constructor(globalOptions)
	{
		super();

		let defaultOptions = {
			size: null,
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			fontColor: 0x000000,
			title: '',
		};

		let options = RenderableUtils.CreateOptions(globalOptions.chart, null, 'options.chart', defaultOptions);

		// Verify given color is an instance of THREE.Color.
		if (!options.backgroundColor instanceof THREE.Color) {
			options.backgroundColor = new THREE.Color(_defaultBackgroundColor);
			Console.warn('Chart.options.backgroundColor is not of type THREE.Color, using default.')
		}

		this._datasets = {};
		this._renderables = [];

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
			this._createAxisView();
			this._createGraphViews();

			this._allowRendering = true;
			this.render();
			this.emit('load');
		});
	}

	_calculateRendererSize()
	{
		// If no size was given, use the given parent element.
		// If no parent element given, throw error.
		let size = this.globals.chart.size;
		if (size === null || size === undefined) {
			let domInfo = RenderableUtils.GetElementInfo(this.globals.chart.parentElement);
			size = domInfo.size;
		}

		// Verify minimum height is satisfied.
		if (size.y < _minimumHeight) {
			_minimumHeightWarning();
			size.y = _minimumHeight;
		}

		this.options.size = size;
	}

	_createRenderer()
	{
		this._calculateRendererSize();

		// Search for the parentElement, if selector specified
		let parentElementInfo = RenderableUtils.GetElementInfo(this.options.parentElement);

		if (parentElementInfo !== null) {
			this._parentElement = parentElementInfo.element;

			// Create canvas element with configured size.
			let canvasElem = document.createElement('canvas');
			canvasElem.width = this.options.size.x;
			canvasElem.height = this.options.size.y;

			this.renderer = new THREE.WebGLRenderer({
				canvas: canvasElem,
				alpha: this.options.useAlpha,
				antialias: true
			});

			this._parentElement.appendChild(canvasElem);

			// If constant size given, no responsive capabilities are used.
			RenderableUtils.AddEvent(window, 'resize', () => { this._onResizeEvent(); });
		} else {
			this.renderer = new THREE.WebGLRenderer({
				alpha: this.options.useAlpha,
				antialias: true
			});
			document.body.appendChild(this.renderer.domElement);
			this.renderer.setSize(this.options.size.x, this.options.size.y, true);
		}

		this.renderer.setPixelRatio(this.options.pixelRatio);
		this._domElement = this.renderer.domElement;
	}

	_onResizeEvent()
	{
		this.options.size.x = this._parentElement.clientWidth;
		this.renderer.setSize(this.options.size.x, this.options.size.y);
		_.forEach(this._renderables, (renderable) => renderable.updateView(this.options.size));
		this.render();
	}

	_createGraphViews()
	{
		_.forEach(this.globals.datasets, (datasetOptions) => {
			let datasetOpts = _.merge(datasetOptions, {
				view: this.views.graph,
				size: this.options.size,
				backgroundColor: this.options.backgroundColor,
			});

			let dataset = new Dataset(datasetOpts);

			this._datasets[dataset._id] = dataset;
			this._renderables.push(dataset);
		});
	}

	_createAxisView()
	{
		let xAxisOptions = _.merge(this.globals.axis.x, {
			view: this.views.xAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
		});
		this._xAxis = new Axis(xAxisOptions);

		let yAxisOptions = _.merge(this.globals.axis.y, {
			view: this.views.yAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
		});
		this._yAxis = new Axis(yAxisOptions);
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

	_setupGestures()
	{
		this.hammer = new Hammer(this._domElement);

		// panning gesture
		let panningGesture = (ev) => {
			_.forEach(this._datasets, (dataset) => dataset.moveCamera(-ev.deltaX * 0.1));
			this._render();
		};

		// zooming gesture
		let zoomGesture = (ev) => {
			_.forEach(this._datasets, (dataset) => dataset.zoomCamera(-ev.deltaY * 0.1));
			this._render();
		};

		this.hammer.on('panright panleft', panningGesture);
		this.hammer.on('panup pandown', zoomGesture);
	}

	_hammerPanHandler(ev)
	{

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
		this._xAxis.render(this.renderer);
		this._yAxis.render(this.renderer);

		_.forEach(this._datasets, (dataset) => {
			dataset.render(this.renderer);
		});
	}
}

export {Chart};