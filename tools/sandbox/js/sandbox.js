main();

function main() {
	let options = {
		size: new THREE.Vector2(800, 200),
		cameraBounds: new THREE.Vector2(1, 1000)
	};

	let chart = new glchart.Chart(options);

	// create random data to add to the dataset instance
    let data = createRandomData(100000, 100);
	let randomDataset = new glchart.Dataset({data: data});
	chart.addDataset(randomDataset);

	// create BitmapText instance
	let bitmapText = new glchart.BitmapText({
		fontPath: 'assets/Lato-Regular-16.fnt',
		texturePath: '../../assets/lato.png'
	});

	document.body.appendChild(chart.domElement);
}

function createRandomData(size, max) {

	if (max === null || max === undefined) max = 1;

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push(new THREE.Vector2(x, Math.random() * max));
	}

	return data;
}