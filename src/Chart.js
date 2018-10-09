import THREE from 'three';
import Hammer from 'hammerjs';
import {HorizontalAxis, VerticalAxis} from './renderables/Axis';
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
			parentElement: null,
			element: null,
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			fontColor: 0x000000,
			resize: true,
			title: '',
		};

		let options = RenderableUtils.CreateOptions(globalOptions.chart, null, 'options.chart', defaultOptions);

		// Verify given color is an instance of THREE.Color.
		if (!options.backgroundColor instanceof THREE.Color) {
			options.backgroundColor = new THREE.Color(_defaultBackgroundColor);
			Console.warn('Chart.options.backgroundColor is not of type THREE.Color, using default.');
		}
		
		// Assert that either a parent element was specified or a canvas element was provided.
		if (_.isNil(options.parentElement) && _.isNil(options.element)) {
			throw 'No parent element or canvas provided';
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

			this._createGraphViews();
			this._createAxisViews();

			this._allowRendering = true;
			this.render();
			this.emit('load');
		});
	}

	_calculateRendererSize()
	{
		// If parentElement given, use parentElement's size
		// else canvas element was provided.
		let size = null;

		if (!_.isNil(this.options.parentElement)) {
			let parentElementId = this.options.parentElement,
				domInfo = RenderableUtils.GetElementInfo(parentElementId);
			
			if (_.isNil(domInfo)) {
				throw `Element with id '${parentElementId}' not found`;
			}

			size = domInfo.size;
		} else {
			let canvas = this.options.element;
			size = {x: canvas.width, y: canvas.height};
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

		// if parent element provided, create canvas as a child of it.
		// else canvas element must be provided
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
			this._canvas = canvasElem;

			// If constant size given, no responsive capabilities are used.
			if (this.options.resize) {
				RenderableUtils.AddEvent(window, 'resize', () => { 
					this._resizeWidthHandler(); 
				});	
			}
		} else {
			this.renderer = new THREE.WebGLRenderer({
				alpha: this.options.useAlpha,
				antialias: true,
				canvas: this.options.element
			});

			this._canvas = this.options.element;
		}

		this.renderer.setPixelRatio(this.options.pixelRatio);
		this._domElement = this.renderer.domElement;
	}

	/**
	 * Resizes the width of the renderer with the new width of the parent
	 * element.
	 */
	_resizeWidthHandler()
	{
		let size = this.options.size;
		size.x = this._parentElement.clientWidth;
		this.changeRendererSize(size.x, size.y);
	}
	
	/**
	 * Change the renderer to the 
	 * @param width 
	 * @param height
	 */
	changeRendererSize (width, height) {
		this.renderer.setSize(width, height);
		let size = new THREE.Vector2(width, height);
		_.forEach(this._renderables, (renderable) => renderable.updateView(size));
		this._updateAxisRanges();
		this.render();
		this.options.size = size;
	}

	_createGraphViews()
	{
		let datasetOpts = _.merge(this.globals.dataset, {
			view: this.views.graph,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
		});

		this._dataset = new Dataset(datasetOpts);
		this._renderables.push(this._dataset);
	}

	_updateAxisRanges()
	{
		let visibleRange = this._dataset.visibleRange;
		this._yAxis.updateRange(visibleRange.y);
		this._xAxis.updateRange(visibleRange.x);
	}

	_createAxisViews()
	{
		let visibleRange = this._dataset.visibleRange;

		// create y vertical axis
		let yAxisOptions = _.merge(this.globals.axis.y, {
			view: this.views.yAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
			fontFactory: this._fontFactory,
			range: visibleRange.y,
		});
		
		this._yAxis = new VerticalAxis(yAxisOptions);
		this._renderables.push(this._yAxis);

		// create x horizontal axis
		let xAxisOptions = _.merge(this.globals.axis.x, {
			view: this.views.xAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
			fontFactory: this._fontFactory,
			range: visibleRange.x,
		});
		this._xAxis = new HorizontalAxis(xAxisOptions);
		this._renderables.push(this._xAxis);
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
			this._dataset.moveCamera(-ev.deltaX * 0.1);
			this._xAxis.update();
			this._updateAxisRanges();
			this._render();
		};

		// zooming gesture
		let zoomGesture = (ev) => {
			this._dataset.zoomCamera(-ev.deltaY * 0.1);
			this._xAxis.update();
			this._updateAxisRanges();
			this._render();
		};

		this.hammer.on('panright panleft', panningGesture);
		this.hammer.on('panup pandown', zoomGesture);
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
		_.forEach(this._renderables, (renderable) => {
			renderable.render(this.renderer);
		});
	}
}

export {Chart};