let RMMQHelper = require('../src/renderables/RMMQ');

function createPeriodicRandomData(size, max) {
	if (max === null || max === undefined) {
		max = 1;
	}

	let data = [];

	for (let x = 0; x < size; x++) {
		data.push([x, (Math.random() * Math.cos(x / 2)) * (Math.random() * Math.sin(x * 10)) * max]);
	}
	return data;
}

let array = [14, 1, 4, 3, 5, 2, 15];
let helper = new RMMQHelper(array);
helper.precomputeRMMQ();

test('Finds min for whole array', () => {
	expect(helper.min(0, array.length - 1)).toBe(1);
});

test('Finds min for subset of array', () => {
	expect(helper.min(2, array.length - 1)).toBe(2);
});

test('Finds min for [r, l] = [r, r]', () => {
	expect(helper.min(0, 0)).toBe(14);
});

test('Finds max for whole array', () => {
	expect(helper.max(0, array.length - 1)).toBe(15);
});

test('Finds max for subset of array', () => {
	expect(helper.max(0, array.length - 3)).toBe(14);
});

test('Finds max for [r, l] = [r, r]', () => {
	expect(helper.max(0, 0)).toBe(14);
});