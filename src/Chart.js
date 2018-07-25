import THREE from 'three';
import _ from 'lodash';
import Hammer from 'hammerjs';
var Vector3 = THREE.Vector3;

class Chart {
	constructor(options)
	{
		this._setupDefaultOptions(options);

		this.scene = new THREE.Scene();
		this.datasetLines = [];

		this._createRenderer();
		this._createCamera();
		this._setupGestures();
	}

	/**
	 * Setups options defults so no checking is needed in rest of the class.
	 * @param options The options passed through the constructor.
	 * @private
	 */
	_setupDefaultOptions(options)
	{
		this.options = {
			size: _.get(options, 'size', new Vector2(400, 200)),
			cameraBounds: _.get(options, 'cameraBounds', new Vector2(1, 100)),
			pixelRatio: _.get(options, 'pixelRatio', window.devicePixelRatio)
		};
	}

	/**
	 * Creates the renderer.
	 * @private
	 */
	_createRenderer()
	{
		this.renderer = new THREE.WebGLRenderer();

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
		let size = this.options.size, cameraBounds = this.options.cameraBounds;
		this.camera = new THREE.OrthographicCamera(0, size.x, 0, size.y, cameraBounds.x, cameraBounds.y);

		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(new Vector3(0, 0, 0));
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
	 * This stub is used for allowing auto rendering when adding datasets, changing datasets, etc. This
	 * is used when the user wants finer grained control over the when we render the charts.
	 * @private
	 */
	_render()
	{
		this.render();
	}

	addDataset(dataset)
	{
		let geometry = new THREE.Geometry();
		_.forEach(dataset, (point) => {
			geometry.vertices.push(new Vector3(point.x, point.y, 0));
		});

		let material = new THREE.LineBasicMaterial({ color: 0x0000ff });
		let line = new THREE.Line(geometry, material);

		this.scene.add(line);
		this.datasetLines.push(line);
		this._render();
	}

	render()
	{
		this.renderer.render(this.scene, this.camera);
	}
}

export {Chart};