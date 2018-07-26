var Vector2 = THREE.Vector2;
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
 *
 * 6. Setup Hammer.js: Setup panning gesture using Hammer.js. It's a
 * little buggy right but it's just for the purpose of working on
 * mobile and desktop.
 */
function main() {
	let options = {
		size: new Vector2(800, 200),
		cameraBounds: new Vector2(1, 1000)
	};

	let chart = new glchart.Chart(options);
	let data = createRandomData(100000, 100);
	let randomDataset = new glchart.Dataset({data: data});
	chart.addDataset(randomDataset);

	document.body.appendChild(chart.domElement);
}

function createRandomData(size, max) {

	if (max === null || max === undefined) max = 1;

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push(new Vector2(x, Math.random() * max));
	}

	return data;
}