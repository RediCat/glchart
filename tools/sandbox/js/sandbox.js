main();

function main () {
	// create providing canvas element
	let newCanvas = document.createElement('canvas');
	document.getElementById('chart2').appendChild(newCanvas);
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
				}
				// {
				// 	name: 'Value 2',
				// 	data: createPeriodicRandomData(10000, 1456)
				// }
				// {
				// 	name: 'Value 3',
				// 	data: createPeriodicRandomData(10000, 1456)
				// }
			]
		}
	}).on('load', () => {
		chart.setVisibleRange(0, 1);

		let miniGraph = chart.createMiniGraph({
			size: {x: 500, y: 100}
		});
		miniGraph.on('load', () => {
			document.getElementById('chart2').appendChild(miniGraph.domElement);
		});
	});

	// create range slider
	let maxRangeVal = 1000;

	let slider = new Slider('#inputRange', {
		min: 0,
		max: maxRangeVal,
		step: 1,
		value: [0, maxRangeVal]
	});

	slider.on('change', () => {
		let sliderVal = slider.getValue();
		let min = sliderVal[0] / maxRangeVal;
		let max = sliderVal[1] / maxRangeVal;
		chart.setVisibleRange(min, max);
	});
}

function createRandomData (size, max) {
	if (max === null || max === undefined) {
		max = 1;
	}

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push([x, Math.random() * max]);
	}

	return data;
}

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

function createLinearGraph (size, max) {
	let yStep = max / 3;
	let xStep = size / 6;
	let data = [];

	for (let x = 0; x < size; x++) {
		if (Math.floor(x / xStep) < 3) {
			data.push([x, yStep * (Math.floor((x / xStep)) + 1)]);
		} else {
			data.push([x, yStep * (Math.floor((x / xStep)) - 2)]);
		}
	}

	return data;
}
