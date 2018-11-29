const documentation = require('documentation');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let js_docs = {
	/**
     * The list of files to use to create documentation.
     */
	files: [
		'src/Chart.js'
	],

	/**
     * The postfix to use when creating the name of the output file.
     * The name is created as '<prefix><filename><postfix>.md'
     */
	postfix: '_info',

	/**
     * The prefix to use when creating the name of the output file.
     * The name is created as '<prefix><filename><postfix>.md'
     */
	prefix: '',

	/**
     * The args object passed to documentation.build(indexes, args).
     *
    */
	args: {
		access: ['public']
	}
};

function rmdir (dir) {
	var list = fs.readdirSync(dir);
	for (var i = 0; i < list.length; i++) {
		var filename = path.join(dir, list[i]);
		var stat = fs.statSync(filename);

		if (filename == '.' || filename == '..') {
			// pass these files
		} else if (stat.isDirectory()) {
			// rmdir recursively
			rmdir(filename);
		} else {
			// rm fiilename
			fs.unlinkSync(filename);
		}
	}
	fs.rmdirSync(dir);
}

const ignored_folder = 'info_md';
const output_folder = path.resolve(__dirname, ignored_folder);

// delete previous run if exists
if (fs.existsSync(output_folder)) {
	rmdir(output_folder);
}

fs.mkdir(output_folder, err => {
	if (err) {
		throw err;
	}

	_.forEach(js_docs.files, filename => {
		let basename = path.basename(filename, '.js');
		let outfile_name = `${js_docs.prefix}${basename}${js_docs.postfix}.md`;

		documentation
			.build(path.resolve(filename), js_docs.args)
			.then(documentation.formats.md)
			.then(output => {
				let file_path = path.resolve(output_folder, outfile_name);
				fs.writeFile(file_path, output, err => {
					if (err) {
						throw err;
					}
					console.log(`Wrote file "${file_path}"`);
				});
			});
	});
});


