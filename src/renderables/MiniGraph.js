import THREE from 'three';
import { EventNode } from '../EventNode';
import { RenderableUtils } from './RenderableUtils';
import { request } from 'http';

class MiniGraph extends EventNode {
	constructor(options) {
        super();
		let required = ['dataset', 'glchart', 'size'];
		RenderableUtils.AssertRequiredFields(options, required, 'MiniGraph.options');
        
        // create shallow copy of options since we're only reading
        this.options = _.clone(options);

        this.loaded = false;

        // init when the stack clears, so we let users to 
        // subscribe to 'load' event
        setTimeout(() => this._init());
    }

    _init() {
        let width = this.options.size.x;
        let height = this.options.size.y;
        
        // set renderer size
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);

        // get dataset geometry and add it to our scene
        let dataset = this.options.dataset;

        // create camera
        let left = 0, right = width;
        let top = height, bottom = 0;
        let near = -2, far = 2;
        this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        this.camera.up.set(0, 1, 0);
        this.camera.position.set(0, 0, 1);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateProjectionMatrix();
        
        // create THREE helper objs
        this.graphBuffer = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
        this.scene = new THREE.Scene(); 
        
        // create plane geometry to render the graph to
        let planeGeom = new THREE.PlaneGeometry(width, height);
        let graphMat = new THREE.MeshBasicMaterial({map: this.graphBuffer.texture});
        this.graphObj = new THREE.Mesh(planeGeom, graphMat);
        this.scene.add(this.graphObj);

        // adjust graph plane to fill screen
        this.graphObj.position.x = width / 2;
        this.graphObj.position.y = height / 2;
        this.graphObj.position.z = 0;
        
        // render graph to texture
        this.renderer.render(dataset._scene, dataset._camera, this.graphBuffer);
        this.renderer.setClearColor(0xccffff);

        // crate range indicator
        let sliderGeom = new THREE.PlaneGeometry(width, height);
        let sliderMat = new THREE.MeshBasicMaterial({color: 0xbbbbbb, transparent: true, opacity: 0.5});
        let sliderObj = new THREE.Mesh(sliderGeom, sliderMat);
        sliderObj.position.y = height / 2;
        sliderObj.position.z = 1;
        this.sliderObj = sliderObj;
        this.scene.add(this.sliderObj);

        // set pos and scale based on min, max visible
        let min = dataset.reqRangeCache.reqmin;
        let max = dataset.reqRangeCache.reqmax;
        this.visibleRangeChanged(min, max);

        // subscribe to visible changed events
        this.options.glchart.on('visibleChanged', (args) => {
            this.visibleRangeChanged(args.min, args.max);
        });

        this.emit('load');
    }

    visibleRangeChanged(min, max) {
        let width = this.options.size.x;
        let sliderObj = this.sliderObj;
        min *= width;
        max *= width;
        sliderObj.position.x = (max + min) * 0.5;
        sliderObj.scale.x = (max - min) / width;

        this.renderer.render(this.scene, this.camera);
    }

    get domElement() {
        if (_.isNil(this.renderer)) return null;
        return this.renderer.domElement;
    }
}

export {MiniGraph};
