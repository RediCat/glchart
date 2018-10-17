function BinarySearch (arr, val, useFloor) {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		const mid = left + Math.floor((right - left) / 2);

		if (arr[mid] === val) {
			return mid;
		}

		if (arr[mid] < val) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	if (val < arr[right] && arr[right - 1] < val) {
		return (useFloor) ? right - 1 : right;
	}

	if (val < arr[left] && arr[left - 1] < val) {
		return (useFloor) ? left - 1 : left;
	}

	return -1;
}

let data = [0, 1, 2, 3, 7, 8, 9];

test('Search for index using floor.', () => {
	expect(BinarySearch(data, 4, true)).toBe(3);
});

test('Search for index using ceil.', () => {
	expect(BinarySearch(data, 4, false)).toBe(4);
});

test('Search for index of val in array', () => {
	expect(BinarySearch(data, 9, true)).toBe(6);
});

test('Search for index of val greater than max val in array', () => {
	expect(BinarySearch(data, 10, true)).toBe(-1);
});

test('Search for index of val less than min val in array', () => {
	expect(BinarySearch(data, -1, true)).toBe(-1);
});
