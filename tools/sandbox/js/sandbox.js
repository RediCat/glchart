/* global $ */
main();

function main () {
	// create providing canvas element
	let newCanvas = document.createElement('canvas');
	document.getElementById('chart').appendChild(newCanvas);
	newCanvas.width = 1000;
	newCanvas.height = 250;

	let chart = new glchart.Chart({
		chart: {
			element: newCanvas,
			fontColor: 0x0000ff,
			title: 'RandomData'
		},
		axis: {
			x: {
				lineColor: 0xaabbff,
				label: 'X'
			},
			y: {
				lineColor: 0x000000,
				label: 'Y'
			}
		},
		dataset: {
			unitsPerPixel: 1,
			values: [
				{
					name: 'Value 1',
					data: createLinearGraph(10000, 1456)
				},
				{
					name: 'Value 2',
					data: createPeriodicRandomData(10000, 1456)
				}
				// {
				// 	name: 'Value 3',
				// 	data: createPeriodicRandomData(10000, 1456)
				// }
			]
		}
	}).on('load', () => {
		chart.setVisibleRange(0, 1);

		let miniGraph = chart.createMiniGraph({
			size: {x: 1000, y: 60}
		});

		// add event handlers to user input in minigraph
		miniGraph
			.on('load', () => {
				document
					.getElementById('slider')
					.appendChild(miniGraph.domElement);
			})
			.on('zoomChanged', delta => {
				let scale = 0.001;
				chart.zoom(delta * scale);
			})
			.on('positionChanged', delta => {
				chart.move(delta);
			});

		// start dummy playback of time.
		requestAnimationFrame(runFrame);
	});

	let start = null;
	function runFrame (timestamp) {
		if (!start) {
			start = timestamp;
		}

		let currentTime = timestamp - start;
		chart.setCurrentPosition(currentTime);
		displayNumber(currentTime);

		requestAnimationFrame(runFrame);
	}

	requestAnimationFrame(runFrame);
}

// function createRandomData (size, max) {
// 	if (max === null || max === undefined) {
// 		max = 1;
// 	}
// 	let data = [];
// 	for (let x = 0; x < size; x++) {
// 		data.push([x, Math.random() * max]);
// 	}
// 	return data;
// }

function createPeriodicRandomData (size, max) {
	if (max === null || max === undefined) {
		max = 1;
	}

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push([
			x,
			Math.random() *
				Math.cos(x / 2) *
				(Math.random() * Math.sin(x * 10)) *
				max
		]);
	}
	return data;
}

function displayNumber (number) {
	$('#numberDisplay').text(number);
}

function createLinearGraph (size, max) {
	let yStep = max / 3;
	let xStep = size / 6;
	let data = [];

	for (let x = 0; x < size; x++) {
		if (Math.floor(x / xStep) < 3) {
			data.push([x, yStep * (Math.floor(x / xStep) + 1)]);
		} else {
			data.push([x, yStep * (Math.floor(x / xStep) - 2)]);
		}
	}

	return data;
}
