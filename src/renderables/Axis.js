import {RenderableView} from "./RenderableView";
import {RenderableUtils} from "./RenderableUtils";

const notchDistance = 10;

class Axis extends RenderableView
{
	// todo: make this a view controlled by data given and assumptions based on the layout
	constructor(options)
	{
		super(options);

		let defaultOptions = {
			label: '',
			lineColor: 0xAABBFF,
			vertical: true,
			steps: 2,
			thickness: 2,
			distanceToRight: 90,
		};
		let required = ['fontFactory'];

		this.options = RenderableUtils.CreateOptions(options, required, 'Axis.options', defaultOptions);

		if (this.options.steps < 2) {
			this.options.steps = 2;
		}

		this._createGrid();
		this._createTextFields();
	}
}

class VerticalAxis extends Axis
{
	_createGrid()
	{
		this.endPositions = [
			0.1, 0.9
		];

		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right,
			lineColor = this.options.lineColor,
			thick = this.options.thickness;

		let verticalGridPoints = [
			[cameraWidth, this.endPositions[0] * cameraHeight],
			[cameraWidth, this.endPositions[1] * cameraHeight],
		];
		let verticalGrid = RenderableUtils.CreateLine(verticalGridPoints, lineColor, thick);
		this.add(verticalGrid);

		_.forEach(this.endPositions, (step) => {
			let yPos = step * cameraHeight;
			let points = [
				[cameraWidth, yPos],
				[cameraWidth - notchDistance, yPos],
			];
			let line = RenderableUtils.CreateLine(points, lineColor, thick);
			this.add(line);
		});
	}

	_createTextFields()
	{
		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right;

		_.forEach(this.endPositions, (step) => {
			let yPos = step * cameraHeight;
			let textPos = [cameraWidth - notchDistance, yPos];
			let text = this.options.fontFactory.create('lato', '0.0');

			text.geometry.computeBoundingBox();
			let bbox = text.geometry.boundingBox;

			text.scale.x = text.scale.y = 0.5;
			text.position.x = textPos[0] - bbox.max.x / 1.5;
			text.position.y = textPos[1] - 5;
			this.add(text);
		});
	}
}

class HorizontalAxis extends Axis
{
	_createGrid()
	{
		this.endPositions = [
			0.1, 0.9
		];

		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right,
			lineColor = this.options.lineColor,
			thick = this.options.thickness;

		let verticalGridPoints = [
			[cameraWidth, this.endPositions[0] * cameraHeight],
			[cameraWidth, this.endPositions[1] * cameraHeight],
		];
		let verticalGrid = RenderableUtils.CreateLine(verticalGridPoints, lineColor, thick);
		this.add(verticalGrid);

		_.forEach(this.endPositions, (step) => {
			let yPos = step * cameraHeight;
			let points = [
				[cameraWidth, yPos],
				[cameraWidth - notchDistance, yPos],
			];
			let line = RenderableUtils.CreateLine(points, lineColor, thick);
			this.add(line);
		});
	}

	_createTextFields()
	{
		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right;

		_.forEach(this.endPositions, (step) => {
			let yPos = step * cameraHeight;
			let textPos = [cameraWidth - notchDistance, yPos];
			let text = this.options.fontFactory.create('lato', '0.0');

			text.geometry.computeBoundingBox();
			let bbox = text.geometry.boundingBox;

			text.scale.x = text.scale.y = 0.5;
			text.position.x = textPos[0] - bbox.max.x / 1.5;
			text.position.y = textPos[1] - 5;
			this.add(text);
		});
	}
}

export {VerticalAxis, HorizontalAxis};