import createTextGeometry from 'three-bmfont-text';
import _ from 'lodash';
import THREE from 'three';
import EventEmitter from 'events';
import loadFont from 'load-bmfont';

class BitmapFont
{
	constructor(options)
	{
		this._events = new EventEmitter();
		this._setupDefaultOptions(options);
		this._load();
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
		this.options.text = _.get(options, 'text', '');
		this.options.width = _.get(options, 'width', 200);
		this.options.align = _.get(options, 'align', 'center');
		this.options.color = _.get(options, 'color', 0xffffff);

		this.name = this.options.name;
	}

	_load()
	{
		loadFont(this.options.fontPath, (err, font) => {
			if (err) {
				throw err;
			}

			this.font = font;

			let textureOnLoad = (texture) => {
				this.texture = texture;

				this.material = new THREE.MeshBasicMaterial({
					map: texture,
					transparent: false,
					color: this.options.color,
					side: THREE.DoubleSide,
				});

				this.textGeometry = createTextGeometry({
					width: this.options.width,
					align: this.options.align,
					font: this.font,
					text: this.options.text
				});

				this.renderable = new THREE.Mesh(this.textGeometry, this.material);
				this._events.emit('load', this);
			};

			let textureOnError = (err) => {
				this._events.emit('error', err);
			};

			new THREE.TextureLoader().load(this.options.texturePath, textureOnLoad, undefined, textureOnError);
		});
	}

	updateText(text)
	{
		this.textGeometry.update(text);
		this.renderable = new THREE.Mesh(this.textGeometry, this.material);
	}

	on(eventName, cb)
	{
		this._events.on(eventName, cb);
		return this;
	}
}

export {BitmapFont}