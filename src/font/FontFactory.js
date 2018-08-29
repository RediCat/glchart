import {Font} from "./Font";

import latoFont from './assets/Lato-Regular-24.fnt';
import latoTexture from './assets/lato.png';

class FontFactory
{
	constructor()
	{
		this._fonts = {};
	}

	loadFonts()
	{
		let fonts = {
			lato: {
				font: latoFont,
				texture: latoTexture,
			}
		};

		let promises = [];
		_.forOwn(fonts, (fontDesc, fontName) => {
			let font = new Font(fontDesc),
				promise = font.load();
			this._fonts[fontName] = font;
			promises.push(promise);
		});

		return Promise.all(promises);
	}

	create(fontName, text, color, width, align)
	{
		let fontObj = this._fonts[fontName];

		if (fontObj === null || fontObj === undefined) {
			throw `Error: Font with name ${fontName} not found.`;
		}

		if (color === undefined) {
			color = fontObj.options.color;
		}

		if (width === undefined) {
			width = fontObj.options.width;
		}

		if (align === undefined) {
			align = fontObj.options.align;
		}

		return fontObj.createMesh(text, color, width, align);
	}

	// updateText(text)
	// {
	// 	this.textGeometry.update(text);
	// 	this.remove(this.mesh);
	// 	this.mesh = new THREE.Mesh(this.textGeometry, this.material);
	// 	this.add(this.mesh);
	// }
}

export {FontFactory}