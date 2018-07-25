var Vector3 = THREE.Vector3;
var Vector2 = THREE.Vector2;

class WebGlChart {
  constructor(options)
  {
    if (window._ === undefined || window._ === null) {
      throw 'lodash appears to be missing.'
    }

    if (window.Hammer === undefined || window.Hammer === null) {
      throw 'Hammer.js appears to be missing.'
    }

    this._setupDefaultOptions(options);

    this.scene = new THREE.Scene();
    this.datasetLines = [];

    this._createRenderer();
    this._createCamera();
    this._setupGestures();
  }

  _setupDefaultOptions(options)
  {
    this.options = {
      size: _.get(options, 'size', new Vector2(400, 200)),
      cameraBounds: _.get(options, 'cameraBounds', new Vector2(1, 100)),
      pixelRatio: _.get(options, 'pixelRatio', window.devicePixelRatio)
    };
  }

  _createRenderer()
  {
    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize(this.options.size.x, this.options.size.y);
    this.renderer.setPixelRatio(this.options.pixelRatio);
    this.domElement = this.renderer.domElement;
  }

  _createCamera()
  {
    let size = this.options.size, cameraBounds = this.options.cameraBounds;
    this.camera = new THREE.OrthographicCamera(0, size.x, 0, size.y, cameraBounds.x, cameraBounds.y);

    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(new Vector3(0, 0, 0));
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