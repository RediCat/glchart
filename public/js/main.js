const Vector3 = THREE.Vector3;
const Vector2 = THREE.Vector2;

main();

/***************
 * From a top level what's happening:
 *
 * 1. Creating a Scene: This acts as the top level scene. Scene are mere
 * collections of drawable objects or other scenes.
 *
 * 2. Create a WebGL Renderer:  Create the renderer and set its size in
 * pixels and its pixel ratio. This is important for high pixel
 * density/"retina" displays. When this renderer is created a canvas
 * element is created from where the drawable context is fetched.
 * For this element to appear on the page, it needs to be added to the
 * DOM.
 *
 * 3. Create a Camera: We create an orthographic camera, vs a perspective
 * camera, since we want to draw the chart in 2d. We position the camera
 * at the (0, 0, 1) point and to look at the center.
 *
 * 4. Create the Line Object: Create a THREE.Line object from a random
 * dataset.
 *
 * 5. Render the line: Render the scene using the previously created
 * camera.
 */
function main() {
  let scope = {
    size: new Vector2(800, 200),
    zBounds: new Vector2(1, 1000)
  };

  let scene = scope.scene = new THREE.Scene();
  let renderer = scope.renderer = createRenderer(scope);
  let camera = scope.camera = createCamera(scope);
  let line = scope.line = createLine();

  // render the chart
  scene.add(line);
  renderer.render(scene, camera);
}

function createRenderer(scope) {

  let renderer = new THREE.WebGLRenderer();

  renderer.setSize(scope.size.x, scope.size.y);
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);

  return renderer;
}

function createCamera(scope) {

  let camera = new THREE.OrthographicCamera(0, scope.size.x, 0, scope.size.y, scope.zBounds.x, scope.zBounds.y);

  camera.position.set(0, 0, 1);
  camera.lookAt(new Vector3(0, 0, 0));

  return camera;
}

function createRandomData(size, max) {

  if (max === null || max === undefined) max = 1;

  let data = [];

  for (let x = 0; x < size; x++) {
    data.push(new Vector2(x, Math.random() * max));
  }

  return data;
}

function createLine() {

  let geometry = new THREE.Geometry();

  _.forEach(createRandomData(10000, 100), (point) => {
    geometry.vertices.push(new Vector3(point.x, point.y, 0));
  });

  let material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  return new THREE.Line(geometry, material);
}