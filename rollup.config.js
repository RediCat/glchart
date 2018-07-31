import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
	input: 'src/glchart.js',
	external: ['three', 'lodash', 'hammerjs'],
	plugins: [
		globals(),
		builtins(),
		resolve(),
		commonJS({
			include: 'node_modules/**'
		})
	],
	output: [
		{
			format: 'umd',
			name: 'glchart',
			file: 'build/glchart.js',
			indent: '\t',
			globals: {
				'three': 'THREE',
				'lodash': '_',
				'hammerjs': 'Hammer'
			},
		},
		{
			format: 'es',
			file: 'build/glchart.module.js',
			indent: '\t',
			globals: {
				'three': 'THREE',
				'lodash': '_',
				'hammerjs': 'Hammer'
			},
		}
	]
};
