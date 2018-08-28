import createTextGeometry from 'three-bmfont-text';
import THREE from 'three';


class FontFactory
{
	constructor()
	{
		let fontFiles = {
			lato: {
				font: '/src/font/assets/Lato-Regular-24.fnt',
				texture: '/src/font/assets/lato.png'
			}
		};

		this._fonts = {};
		_.forOwn(fontFiles, (fontDesc, fontName) => {
			
		});




		let onLoad = (font, texture) => {
			this.font = font;

			this.material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				color: this.options.color,
				side: THREE.DoubleSide,
			});

			this.textGeometry = createTextGeometry({
				width: this.options.width,
				align: this.options.align,
				font: this.font,
				text: this.options.text,
				flipY: texture.flipY
			});

			this.mesh = new THREE.Mesh(this.textGeometry, this.material);
			this.add(this.mesh);
			this.renderable.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI);
		};

		let onError = (err) => {
			this.emit('error', err);
		};

		RenderableUtils.LoadFont(this.options.fontPath, this.options.texturePath, onLoad, onError);
	}


	_setupDefaultOptions(options)
	{
		let requiredOptions = ['fontPath', 'texturePath'],
			optName = 'BitmapFont.options';
		this.options = RenderableUtils.CreateOptions(options, requiredOptions, optName, {
			text: '',
			width: 200,
			align: 'left',
			color: 0xffffff
		});
	}

	updateText(text)
	{
		this.textGeometry.update(text);
		this.remove(this.mesh);
		this.mesh = new THREE.Mesh(this.textGeometry, this.material);
		this.add(this.mesh);
	}
}

export {FontFactory}