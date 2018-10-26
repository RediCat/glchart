class RMMQHelper {
	constructor(array, getter) {
		if (getter === null || getter === undefined) {
			getter = (arr, i) => arr[i];
		}
		this.getter = getter;
		this.array = array;
		this.precomputeLogs();
	}

	precomputeLogs() {
		this.logs = [];
		this.logs[1] = 0;
		for (let i = 2; i <= this.array.length; i++) {
			this.logs[i] = this.logs[Math.floor(i / 2)] + 1;
		}
	}

	precomputeRMMQ (k = 25) {
		let array = this.array;
		let getter = (i) => this.getter(this.array, i);

		let min = [];
		let max = [];
		for (let index = 0; index < array.length; index++) {
			min[index] = [getter(index)];
			max[index] = [getter(index)];
		}

		for (let j = 1; j <= k; j++) {
			for (let i = 0; i + (1 << j) <= array.length; i++) {
				min[i][j] = Math.min(min[i][j - 1], min[i + (1 << (j - 1))][j - 1]);
				max[i][j] = Math.max(max[i][j - 1], max[i + (1 << (j - 1))][j - 1]);
			}
		}

		this.minPrecomp = min;
		this.maxPrecomp = max;
	}

	min (l, r) {
		let j = this.logs[r - l + 1];
		return Math.min(this.minPrecomp[l][j], this.minPrecomp[r - (1 << j) + 1][j]);
	}

	max (l, r) {
		let j = this.logs[r - l + 1];
		return Math.max(this.maxPrecomp[l][j], this.maxPrecomp[r - (1 << j) + 1][j]);
	}
}

//module.exports = RMMQHelper;
export {RMMQHelper}
