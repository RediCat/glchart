import THREE from 'three';
import { EventNode } from '../EventNode';
import { RenderableUtils } from './RenderableUtils';

class MiniGraph extends EventNode {
	constructor(options) {
        super();
		let required = ['dataset', 'glchart', 'size'];
		let defaults = {};
		this.options = RenderableUtils.CreateOptions(
			options,
			required,
			'MiniGraph.options',
			defaults
        );
        
        this.loaded = false;

        // init when the stack clears, so we let users to 
        // subscribe to 'load' event
        setTimeout(() => {
            let width = this.options.size.x;
            let height = this.options.size.y;
            
            // set renderer size
            this.renderer = new THREE.WebGlRenderer();
            this.renderer.setSize(width, height);

            // get dataset geometry and add it to our scene
            let dataset = this.options.dataset;

            // create camera
            let left = 0, right = width;
            let top = height, bottom = 0;
            let near = 0, far = 1;
            this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
            this.camera.up.set(0, 1, 0);
            this.camera.position.set(0, 0, 1);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.updateProjectionMatrix();
            
            // create THREE helper objs
            this.graphBuffer = new THREE.WebGLBufferRenderer(width, height);
            this.scene = new THREE.Scene();

            // let ui render before starting to render the graph buffer
            setTimeout(() =>{
                // create plane geometry to render the graph to
                this.planeGeom = new THREE.PlaneGeometry(width, height);
                this.graphMat = new THREE.MeshBasicMaterial({map: this.graphBuffer});
                this.graphObj = new THREE.Mesh(this.planeGeom, this.graphMat);
                this.scene.add(this.graphObj);

                // render graph to texture
                let scaleXCache = this.camera.scale.x;
                this.camera.scale.x = dataset._camera.scale.x;
                this.renderer.render(dataset._scene, this.camera, this.graphBuffer);
                this.camera.scale = scaleXCache;

                setTimeout(() => {
                    this.renderer.render(this.scene, this.camera);
                    this.emit('load');
                });
            });
        });
    }

    get domElement() {
        if (_.isNil(this.renderer)) return null;
        return this.renderer.domElement;
    }
}

export {MiniGraph};
