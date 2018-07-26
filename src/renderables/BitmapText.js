import createTextGeometry from 'three-bmfont-text'
import loadFont from 'load-bmfont'
import _ from 'lodash';
import THREE from 'three';

class BitmapText
{
	constructor(options)
	{
		this._setupDefaultOptions(options);
		this._loadFont();
	}

	_setupDefaultOptions(options)
	{
		if (!_.has(options, 'fontPath')) {
			throw 'options.fontPath was not defined';
		} else if (!_.has(options, 'texturePath')) {
			throw 'options.texturePath was not defined';
		}

		this.options = options;
		this.options.width = _.get(options, 'width', 200);
		this.options.align = _.get(options, 'align', 'left');
		this.options.color = _.get(options, 'color', 0xaaaaaa);
	}

	_loadFont()
	{
		loadFont(this.options.fontPath, (err, font) => {
				if (err) {
					throw `Error while loading font: ${err}`;
				}

				this.font = font;

				let geometry = createTextGeometry({
					width: this.options.width,
					align: this.options.align,
					font: font
				});

				let textureLoader = new THREE.TextureLoader();

				textureLoader.load(this.options.texturePath, (texture) => {
					let material = new THREE.MeshBasicMaterial({
						map: texture,
						transparent: true,
						color: this.options.color
					});

					this.mesh = new THREE.Mesh(geometry, material)
				});
		});
	}
}

export {BitmapText}