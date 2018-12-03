import THREE from "three";
import { HorizontalAxis, VerticalAxis } from "./renderables/Axis";
import { Dataset } from "./renderables/Dataset";
import { FontFactory } from "./font/FontFactory";
import { RenderableUtils } from "./renderables/RenderableUtils";
import { EventNode } from "./EventNode";
import { LegendView } from "./renderables/LegendView";
import { MiniGraph } from './renderables/MiniGraph';

const _defaultBackgroundColor = 0xffffff;
const _minimumHeight = 200;
const _minimumHeightWarning = _.once(() => {
	console.warn(
        `Minimum height of ${_minimumHeight}px is not ` +
        `satisfied. Forcing to ${_minimumHeight}px.`
	);
});

class Chart extends EventNode {
	constructor(globalOptions) {
		super();

		let defaultOptions = {
			parentElement: null,
			element: null,
			pixelRatio: window.devicePixelRatio,
			useAlpha: true,
			backgroundColor: new THREE.Color(_defaultBackgroundColor),
			fontColor: 0x000000,
			resize: true,
			zoomEnabled: false,
			title: '',
			cursorPosition: 0
		};

		let options = RenderableUtils.CreateOptions(
			globalOptions.chart,
			null,
			"options.chart",
			defaultOptions
		);

		// Verify given color is an instance of THREE.Color.
		if (!options.backgroundColor instanceof THREE.Color) {
            options.backgroundColor = 
                new THREE.Color(_defaultBackgroundColor);
			Console.warn(
                "Chart.options.backgroundColor is not of" + 
                "type THREE.Color, using default."
			);
		}

        // Assert that either a parent element was specified or a canvas 
        // element was provided.
		if (_.isNil(options.parentElement) && _.isNil(options.element)) {
			throw "No parent element or canvas provided";
		}
		
		this._renderables = [];

		// todo: make this views reactive.
		this.views = {
			legend: {
				left: 0,
				top: 0,
				width: 1.0,
				height: 0.15
			},
			graph: {
				left: 0.1,
				top: 0.15,
				width: 0.9,
				height: 0.6
			},
			xAxis: {
				left: 0.1,
				top: 0.75,
				width: 0.9,
				height: 0.25
			},
			yAxis: {
				left: 0,
				top: 0.15,
				width: 0.1,
				height: 0.6
			}
		};

        this._allowRendering = false;
		this.globals = globalOptions;
        this.options = options;

		this._createFontFactory().then(() => {
			this._createRenderer();

			this._createGraphViews();
			this._createAxisViews();
			this._createLegendView();
            
            // set default visibility to whole graph
            this.setVisibleRange(0, 1);

            this._allowRendering = true;
			this.render();
			this.emit('load');
		});
	}

	_calculateRendererSize() {
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
			size = { x: canvas.width, y: canvas.height };
		}

		// Verify minimum height is satisfied.
		if (size.y < _minimumHeight) {
			_minimumHeightWarning();
			size.y = _minimumHeight;
		}

		this.options.size = size;
	}

	_createRenderer() {
		this._calculateRendererSize();

		// Search for the parentElement, if selector specified
		let parentElementInfo = RenderableUtils.GetElementInfo(
			this.options.parentElement
		);

		// if parent element provided, create canvas as a child of it.
		// else canvas element must be provided
		if (parentElementInfo !== null) {
			this._parentElement = parentElementInfo.element;

			// Create canvas element with configured size.
			let canvasElem = document.createElement("canvas");
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

		this.on("resize", () => this._onResizeEvent());
		this.renderer.setPixelRatio(this.options.pixelRatio);
		this._domElement = this.renderer.domElement;
	}

	_resizeWidthHandler()
	{
		let size = this.options.size;
		size.x = this._parentElement.clientWidth;
        this.changeRendererSize(size.x, size.y);
    }

	_createGraphViews() {
		let datasetOpts = _.merge(this.globals.dataset, {
			view: this.views.graph,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
			currentPosition: this.options.currentPosition
		});

		this._dataset = new Dataset(datasetOpts);
		this._renderables.push(this._dataset);
	}

	_updateAxisRanges() {
		let visibleRange = this._dataset.visibleRange;

		if (this.options.zoomEnabled) {
			this._yAxis.updateRange(visibleRange.y);
		} else {
			this._yAxis.updateRange(this._dataset.options.stats.y);
		}

		this._xAxis.updateRange(visibleRange.x);
		this._xAxis.update();
		this._yAxis.update();
	}

	_createAxisViews() {
		let visibleRange = this._dataset.visibleRange;

		// create y vertical axis
		let yAxisOptions = _.merge(this.globals.axis.y, {
			view: this.views.yAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
			fontFactory: this._fontFactory,
			range: visibleRange.y
		});
		
		this._yAxis = new VerticalAxis(yAxisOptions);
		this._renderables.push(this._yAxis);

		// create x horizontal axis
		let xAxisOptions = _.merge(this.globals.axis.x, {
			view: this.views.xAxis,
			size: this.options.size,
			backgroundColor: this.options.backgroundColor,
			fontFactory: this._fontFactory,
			range: visibleRange.x
		});
		this._xAxis = new HorizontalAxis(xAxisOptions);
		this._renderables.push(this._xAxis);
	}

	_createLegendView() {
		let legendOptions = {
			view: this.views.legend,
			size: this.options.size,
			fontFactory: this._fontFactory,
			labels: []
		};

		// create legend data from dataset
		_.forEach(this._dataset.options.values, (val) => {
			legendOptions.labels.push({name: val.name, color: val.color});
		});

		this._legend = new LegendView(legendOptions);
		this._renderables.push(this._legend);
	}

	_createFontFactory() {
		return new Promise((resolve, reject) => {
			this._fontFactory = new FontFactory();
			this._fontFactory
				.loadFonts()
				.catch(err => reject(err))
				.then(() => {
					resolve();
				});
		});
	}

	_render() {
		if (!this._allowRendering) {
			return;
		}
		this.render();
	}

    //#region Public API

    /**
     * @public
     * Renders all the renderable views in chart. Generally this means the 
     * dataset, x axis, y axis and title view.
     */
	render() {
		_.forEach(this._renderables, renderable => {
			renderable.render(this.renderer);
		});
	}

	/**
     * @public
	 * Change the renderer's size to the given width and height in pixels.
	 * @param {number} width The new renderer's width in px.
	 * @param {number} height The new renderer's height in px.
	 */
	changeRendererSize(width, height) 
	{
		this.renderer.setSize(width, height);
		let size = this.options.size = new THREE.Vector2(width, height);
		_.forEach(this._renderables, (renderable) => renderable.updateView(size));
		this._updateAxisRanges();
		this.render();
	}

	/**
     * @public
	 * Sets the range of the dataset shown in the chart. After updating the
     * state of the graph, 'visibleChanged' event is emitted. This event has 
     * one argument, an object with properties 'min' and 'max', the minimum and 
     * maximum visible range in the [0, 1] range.
	 * @param {number} min 
	 * @param {number} max
	 */
	setVisibleRange(min, max) 
	{
        this._dataset.setVisibleRange(min, max);
        this._updateAxisRanges();
        this._render();
        this._lastVisibleRange = {min, max};
        this.emit('visibleChanged', {min, max});
    }
    
    /**
     * @public
     * Creates a minigraph representation, with sliding and zooming options.
     * @param {'size': {x: number, y: number}, *} options Required size and other
     * arguments. 
     * @return {MiniGraph} A MiniGraph instance of this chart.
     */
    createMiniGraph(options) 
    {
        // return null
        // if options not given or
        // if empty object given
        if (_.isNil(options)) return null;
        if (_.isEqual(options, {})) return null;

        // add ref to dataset obj and glchart obj
        options = _.extend(options, {
            dataset: this._dataset,
            glchart: this,
        });

        // create minigraph obj and keep ref to it
        try {
            let minigraph = this._minigraph = new MiniGraph(options);
            return minigraph;
        } catch (e) {
            console.error(e);
            this._minigraph = null;
            return null;
        }
    }

    /**
     * Change the 'zoom', the amount of visibility in the x axis.
     * @param {number} percent Number between [0, 1] that represents the 
     * change in visibility.
     */
    zoom(percent) {
        percent = Math.min(percent, 1);
        percent = Math.max(percent, -1);
        let oldMin = this._lastVisibleRange.min;
        let oldMax = this._lastVisibleRange.max;
        let newDelta = (oldMax - oldMin) * (1 + (0.5 * percent));
        let newMin = ((oldMax + oldMin) * 0.5) - (newDelta * 0.5);
        let newMax = ((oldMax + oldMin) * 0.5) + (newDelta * 0.5);

        newMin = Math.max(newMin, 0);
        newMax = Math.min(newMax, 1);
        this.setVisibleRange(newMin, newMax);
        return {newMin, newMax};
    }

    /**
     * Change the visible range in the x position.
     * @param {number} delta Change in the x position.
     */
    move(delta) {
        let newMin = this._lastVisibleRange.min + delta;
        let newMax = this._lastVisibleRange.max + delta;
        if (newMin < 0 || newMax > 1) return;
		this.setVisibleRange(newMin, newMax);
	}
    
    /**
     * @public
     * Set the current position of the track in dataset's units.
     * @param {number} position 
     */
	setCurrentPosition(position) {
        this.options.currentPosition = position;
        
        // chack if already wed
		if (this._dataset) {
			this._dataset.setCurrentPosition(position); 	
		}
		
		// also update minigraph if created
		if (this._minigraph) {
			this._minigraph.setCurrentPosition(position);
		}

		this._render();
	}

    /**
     * @public
     * @property currentPosition
     * @return {number} The current position of the track for this graph.
     */
	get currentPosition() {
		return this.options.cursorPosition;
    }

    /**
     * @public
     * @param {string} name Name of the subset to set/get the status.
     * @param {boolean} value Value to set to the specified subset.
     * @returns {boolean|null} The current status of the subset if only the 
     * name is specified. If both parameters are given or the subset is not 
     * found, void is returned.
     */
    subsetStatus(name, value) {
        if (this._dataset) {
            let ret = this._dataset.subsetStatus(name, value);

            // if call didn't return anything, setter called and maybe we've
            // a dirty screen, render just in case
            if (_.isNil(ret)) {
                this.render();
                return;
            }
            return ret;
        }
    }
    //#endregion
}

export { Chart };
