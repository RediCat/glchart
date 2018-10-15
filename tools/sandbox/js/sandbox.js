main();

function main () {
	// create providing canvas element
	let newCanvas = document.createElement('canvas');
	document.getElementById('chart2').appendChild(newCanvas);
	newCanvas.width = 500;
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
			unitPerPixel: 1 / 10,
			values: [
				{
					name: 'Value 1',
					data: createRandomData(10000, 1456),
					color: 0x0000ff
				}
			]
		}
	}).on('load', () => {
		chart.setVisibleRange(0, 1);
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
