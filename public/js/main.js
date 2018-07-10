const Vector3 = THREE.Vector3;
const Vector2 = THREE.Vector2;

main();

function main() {
  let scope = {
    size: new Vector2(800, 200),
    zBounds: new Vector2(1, 1000)
  };

  let scene = scope.scene = new THREE.Scene();
  let renderer = scope.renderer = createRenderer(scope);
  let camera = scope.camera = createCamera(scope);
  let line = scope.line = createLine();

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

  camera.position.set(0, 0, 100);
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