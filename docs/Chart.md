`Chart` Class
==================

## Options

#### `pixelRatio` : `float` : default = `window.devicePixelRatio`
The pixel ratio passed to the `THREE.WebGLRenderer.setPixelRatio` method.

---

#### `cameraBounds` : `THREE.Vector2` : default = `THREE.Vector2(1, 100)`
The size of the camera. Specifies the leftmost and rightmost point to show
points that is shown by the camera.

---

#### `size` : `THREE.Vector2` : default = `THREE.Vector2(400, 200)`
The size of the canvas created for drawing context.

---

#### `useAlpha` : `bool` : default = `true`
Allow alpha usage in the webgl renderer created to draw the charts.

## Methods

`addDataset(dataset)` : `void`

`dataset` : `array([{x, y}])` : array of objects representing x and y points.

Adds a dataset to the chart.

---

`render()` : `void`

Renders the currently added datasets.