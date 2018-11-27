import {RenderableNode} from "./RenderableNode";
import {RenderableUtils} from "./RenderableUtils";
import THREE from "three";

class RenderableView extends RenderableNode
{
	constructor(options)
	{
		super(options);

		let required = ['view', 'size'],
			defaultOptions = {backgroundColor: null};

        this.options = RenderableUtils.CreateOptions(options, required, 
            'RenderableView.options', defaultOptions);s
		this._renderables = {};

		this._createCamera();
	}

	_createCamera() {
		let left = 0, bottom = 0,
			near = 0, far = 1;

        let viewSize = this.viewSize;

        let camera = new THREE.OrthographicCamera(left, viewSize.x, viewSize.y, 
            bottom, near, far);

		camera.up.set(0, 1, 0);
		camera.position.set(0, 0, 1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		camera.updateProjectionMatrix();

		this._camera = camera;
	}

    _cameraPositionChanged () {
        // if camera less than 0, set to 0
        if (this._camera.position.x < 0) {
			this._camera.position.x = 0;
        }
    }

    /**
     * @private
     * Moves camera based on the number given.
     * @param {number} delta 
     */
	moveCamera(delta) {
		this._camera.position.x += delta;
		this._cameraPositionChanged();
    }
    
    /**
     * @private
     * Sets the camera's x position to the given value.
     * @param {number} pos The x axis position of the camera.
     */
    setCameraPosition (pos) {
        this._camera.position.x = pos;
        this._cameraPositionChanged();
    }

    /**
     * @private
     * Sets the amount of units of the x axis is shown.
     * @param {number} range range of values to show on x axis
     */
    setCameraXRange(range) {
        let xScale = range / this.viewSize.x;
        this._camera.scale.x = xScale;
        this._camera.updateProjectionMatrix();
	}

    get viewSize () {
        let size = this.options.size,
			view = this.options.view;

        let top = size.y * view.height,
            right = size.x * view.width;
        
        return {x: right, y: top};
    }

	render(renderer) {
		let size = this.options.size,
			view = this.options.view;

		let left = Math.floor(size.x * view.left),
			top = Math.floor(size.y * view.top),
			width = Math.floor(size.x * view.width),
			height = Math.floor(size.y * view.height);

		renderer.setViewport(left, top, width, height);
		renderer.setScissor(left, top, width, height);
		renderer.setScissorTest(true);

		super.render(renderer, this._camera);
	}

    /**
     * @private
     * Updates the camera with the correct values based on the 
     * size given.
     * @param {{x: number, y: number}} size 
     */
	updateView(size) {
		if (!(size instanceof THREE.Vector2)) {
			throw 'Error: size not of type THREE.Vector2';
		}

        // TODO: modify to use current camera and not create a new one
        
		this.options.size = size;
		let cameraX = this._camera.position.x;
		let cameraScale = this._camera.scale.x;
		this._camera = null;
		this._createCamera();
		this._camera.position.x = cameraX;
		this._camera.scale.x = cameraScale;

		this.emit('resize');
    }
}

export {RenderableView};

