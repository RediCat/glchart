main();

function main()
{
	new glchart.Chart({
		chart: {
			parentElement: '#renderingArea',
			fontColor: 0x0000ff,
			title: 'RandomData'
		},
		axis: {
			x: {
				lineColor: 0xaabbff,
				label: 'X',
			},
			y: {
				lineColor: 0x000000,
				label: 'Y'
			},
		},
		// todo: make unitPerPixel be a global for all the subdatasets.
		datasets: [
			{
				name: 'Value 1',
				data: createRandomData(10000, 1456),
				color: 0x0000FF,
				unitPerPixel: 1/10,
			}
		]
	});
}

function createRandomData(size, max)
{
	if (max === null || max === undefined) max = 1;

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push([x, Math.random() * max]);
	}

	return data;
}