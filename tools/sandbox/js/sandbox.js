main();

function main()
{
	let chart = new glchart.Chart({
		size: new THREE.Vector2(800, 200),
		cameraBounds: new THREE.Vector2(-100, 100),
		orthographic: true,
		parentElement: '#renderingArea'
	});

	// create BitmapFont instance
	new glchart.BitmapFont({
		name: 'Lato',
		fontPath: '/assets/Lato-Regular-16.fnt',
		texturePath: '/assets/lato.png',
		color: 0x0000ff,
		text: 'Random Data'
	}).on('load', (bitmapFont) => {
		console.log('loaded bitmap font');
		console.log(bitmapFont);

		// create random data to add to the dataset instance
		let data = createRandomData(10000, 100);
		let randomDataset = new glchart.Dataset({data: data});

		// create Axis info
		randomDataset.add(new glchart.Axis({
			name: 'RandomData',
			xLabel: 'X', yLabel: 'Y',
		}));

		chart.add(randomDataset);
		chart.add(bitmapFont);

		document.body.appendChild(chart.domElement);
	}).on('error', (err) => {
		console.error(err);
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