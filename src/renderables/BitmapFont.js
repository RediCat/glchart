import createTextGeometry from 'three-bmfont-text';
import _ from 'lodash';
import THREE from 'three';
const loadFont = require('load-bmfont');

class BitmapFont
{
	constructor(options, cb)
	{
		cb = typeof cb === 'function' ? cb : () => {};
		this._setupDefaultOptions(options);
		this._loadFont(cb);
	}

	_setupDefaultOptions(options)
	{
	    let requiredOptions = ['name', 'fontPath', 'texturePath'];
	    _.forEach(requiredOptions, (requiredOption) => {
	        if (!_.has(options, requiredOption)) {
	            throw `options.${requiredOption} was not defined`;
            }
        });

		this.options = _.cloneDeep(options);
		this.options.width = _.get(options, 'width', 200);
		this.options.align = _.get(options, 'align', 'left');
		this.options.color = _.get(options, 'color', 0xaaaaaa);

		this.name = this.options.name;
	}

	_loadFont(cb)
	{
		loadFont(this.options.fontPath, (err, font) => {
			if (err) {
				throw err;
			}

			this.font = font;
			this.textGeometry = createTextGeometry({
				width: this.options.width,
				align: this.options.align,
				font: font
			});


			let textureOnLoad = (texture) => {
                this.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    color: this.options.color
                });

                this.mesh = new THREE.Mesh(this.textGeometry, this.material);
                cb(this, null);
            };

			let textureOnError = (err) => {
				cb(null, err);
			};

			new THREE.TextureLoader().load(this.options.texturePath, textureOnLoad, undefined, textureOnError);
		});
	}

	updateText(text)
	{
		this.textGeometry.update(text);
	}
}

export {BitmapFont}