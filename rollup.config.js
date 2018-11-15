import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import fileAsBlob from 'rollup-plugin-file-as-blob';
import string from 'rollup-plugin-string';

export default {
	input: 'src/glchart.js',
	external: ['three', 'lodash'],
	plugins: [
		commonJS({
			include: 'node_modules/**'
		}),
		globals(),
		builtins(),
		resolve({
			jsnext: true,
			browser: true
		}),
		fileAsBlob({
			include: '**/**.png'
		}),
		string({
			include: '**/**.fnt'
		})
	],
	output: [
		{
			format: 'umd',
			name: 'glchart',
			file: 'build/glchart.js',
			indent: '\t',
			sourcemap: true,
			globals: {
				'three': 'THREE',
				'lodash': '_'
			},
		}
	]
};
