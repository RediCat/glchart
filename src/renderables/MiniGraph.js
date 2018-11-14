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
        setTimeout(() => {
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
            let near = 0, far = 1;
            this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
            this.camera.up.set(0, 1, 0);
            this.camera.position.set(0, 0, 1);
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.camera.updateProjectionMatrix();
            
            // create THREE helper objs
            this.graphBuffer = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
            this.scene = new THREE.Scene(); 

            // let ui render before starting to render the graph buffer
            setTimeout(() =>{
                // create plane geometry to render the graph to
                this.planeGeom = new THREE.PlaneGeometry(width, height);
                this.graphMat = new THREE.MeshBasicMaterial({map: this.graphBuffer.texture});
                this.graphObj = new THREE.Mesh(this.planeGeom, this.graphMat);
                this.scene.add(this.graphObj);

                // adjust graph plane to fill screen
                this.graphObj.position.x = width / 2;
                this.graphObj.position.y = height / 2;
                
                // render graph to texture
                this.renderer.render(dataset._scene, dataset._camera, this.graphBuffer);
                this.renderer.setClearColor(0xccffff);

                setTimeout(() => {
                    this.renderer.render(this.scene, this.camera);

                    this.emit('load');

                    let lastFrame = performance.now();
                    let animate = (timestamp) => {
                        let delta = (timestamp - lastFrame) / 1000;
                        //this.graphObj.rotateY(1 * delta);
                        this.renderer.render(this.scene, this.camera);
                        lastFrame = timestamp;
                        requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
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
