import {RenderableView} from "./RenderableView";
import {RenderableUtils} from "./RenderableUtils";

const notchDistance = 10;

class AxisView extends RenderableView
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
			thickness: 1,
		};
		let required = ['fontFactory'];

		this.options = RenderableUtils.CreateOptions(options, required, 'Axis.options', defaultOptions);

		if (this.options.steps < 2) {
			this.options.steps = 2;
		}

		this._createGrid();
		this._createTextFields();

		this.on('resize', () => {
			this.empty();
			this._createGrid();
			this._createTextFields();
		});
	}
}

class VerticalAxis extends AxisView
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

class HorizontalAxis extends AxisView
{
	_createGrid()
	{
		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right,
			lineColor = this.options.lineColor,
			thick = this.options.thickness;

		let verticalGridPoints = [
			[0, cameraHeight],
			[cameraWidth, cameraHeight],
		];
		let horGrid = RenderableUtils.CreateLine(verticalGridPoints, lineColor, thick);
		this.add(horGrid);

		_.forEach([0, 1], (step) => {
			let xPos = step * cameraWidth;
			let points = [
				[xPos, cameraHeight],
				[xPos, cameraHeight - notchDistance],
			];
			let line = RenderableUtils.CreateLine(points, lineColor, thick);
			this.add(line);
		});
	}

	_createTextFields()
	{
		let cameraHeight = this._camera.top,
			cameraWidth = this._camera.right;

		// draw first notch
		let text = this.options.fontFactory.create('lato', '0.0');
		text.scale.x = text.scale.y = 0.5;
		text.position.x = 5;
		text.position.y = cameraHeight - notchDistance - 5;
		this.add(text);

		// draw last notch
		text = this.options.fontFactory.create('lato', '0.0');
		text.scale.x = text.scale.y = 0.5;
		text.position.x = cameraWidth - 20;
		text.position.y = cameraHeight - notchDistance - 5;
		this.add(text);
	}
}

export {VerticalAxis, HorizontalAxis};