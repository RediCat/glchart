import THREE from "three";
import _ from 'lodash';
import {RenderableUtils} from "./RenderableUtils";
import {RenderableView} from "./RenderableView";

class LegendView extends RenderableView {
	constructor(options) {
		super(options);
		
		let requiredOptions = ['labels', 'fontFactory'];
		let defaultOptions = {};
		this.options = RenderableUtils.CreateOptions(
			options,
			requiredOptions,
			'LegendView.options',
			defaultOptions
		);

		this.init();
	}

	brightness(r, g, b) {
		return (r * 299 + g * 587 + b * 114) / 1000
	}
	 
	init() {
		this.on('resize', () => this.sizeInPixelsCache = null);
		let size = this.viewSize;
		let labels = this.options.labels;
		let fontFactory = this.options.fontFactory;

		// split horz space in numbers of labels
		let labelWidth = size.x / labels.length;
		for (let index = 0; index < labels.length; index++) {
			let plane = this.createPlane(labelWidth, size.y, labels[index].color);
			plane.up = new THREE.Vector3(0, 1, 0);
			plane.position.x = index * labelWidth + (labelWidth / 2);
			plane.position.z = 0;
			this.add(plane);
			
			let color = 0x000000;
			let r = 0xFF0000 & labels[index].color;
			let g = 0xFF00 & labels[index].color;
			let b = 0xFF & labels[index].color;

			if (this.brightness(r, g, b) > 123) {
				color = 0xFFFFFF;
			}

			let text = fontFactory.create('lato', labels[index].name, color);
			text.position.x = index * labelWidth + (labelWidth / 2);
			text.position.z = 1;
			text.position.y = (size.y * 0.25) / 2;
			text.scale.x = text.scale.y = 0.75;
			this.add(text);
		}
	}

	createPlane(width, height, color) {
		var geometry = new THREE.PlaneGeometry(width, height);
		var material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide} );
		var plane = new THREE.Mesh(geometry, material);
		return plane;
	}
}

export {LegendView};