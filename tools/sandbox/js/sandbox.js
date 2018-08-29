main();

function main()
{
	new glchart.Chart({
		chart: {
			size: new THREE.Vector2(800, 200),
			orthographic: true,
			parentElement: '#renderingArea',
			fontColor: 0x0000ff,
			title: 'RandomData'
		},
		axis: {
			lineColor: 0xaabbff,
			xLabel: 'X',
			yLabel: 'Y'
		},
		datasets: [
			{
				name: 'Value 1',
				data: createRandomData(1000, 100)
			}
		]
	});
}

function createRandomData(size, max)
{
	if (max === null || max === undefined) max = 1;

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push([x * 10, Math.random() * max]);
	}

	return data;
}