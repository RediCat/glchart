import THREE from 'three';
import parse from 'parse-bmfont-ascii';
import {RenderableUtils} from '../renderables/RenderableUtils';
import {RenderableNode} from "../renderables/RenderableNode";
import createTextGeometry from "three-bmfont-text";

class Font
{
	constructor(opts) {
		let required = ['font', 'texture'];
		let defaultOptions = {
			width: 100,
			align: 'left',
			color: 0x000000,
		};
		this.options = RenderableUtils.CreateOptions(opts, required, 'Font.options', defaultOptions);
		this.texture = null;
		this.font = null;
	}

	load()
	{
		return new Promise((resolve, reject) => {
			this.font = parse(this.options.font);

			let image = new Image();
			image.src = this.options.texture;
			image.onload = () => {
				this.texture = new THREE.Texture();
				this.texture.image = image;
				this.texture.needsUpdate = true;
				resolve();
			};
			image.onerror = (err) => reject(err);
		});
	}

	createMesh(text, color, width, align)
	{
		if (this.texture === null || this.font === null) {
			throw 'Error: cant create mesh without loading font/texture.';
		}

		let material = new THREE.MeshBasicMaterial({
			map: this.texture,
			transparent: true,
			color: color,
			side: THREE.DoubleSide,
		});

		let textGeometry = createTextGeometry({
			width: width,
			align: align,
			font: this.font,
			text: text,
			flipY: this.texture.flipY
		});

		let mesh = new THREE.Mesh(textGeometry, material);
		mesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI);
		return mesh;
	}
}

export {Font};