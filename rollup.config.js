import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'

export default {
	input: 'src/webgl-chart.js',
	external: ['three', 'lodash', 'hammerjs'],
	plugins: [
		resolve(),
		commonJS({
			include: 'node_modules/**'
		})
	],
	output: [
		{
			format: 'umd',
			name: 'glchart',
			file: 'build/webgl-chart.js',
			indent: '\t',
			globals: {
				'three': 'THREE',
				'lodash': '_',
				'hammerjs': 'Hammer'
			},
		},
		{
			format: 'es',
			file: 'build/webgl-chart.module.js',
			indent: '\t',
			globals: {
				'three': 'THREE',
				'lodash': '_',
				'hammerjs': 'Hammer'
			},
		}
	]
};
