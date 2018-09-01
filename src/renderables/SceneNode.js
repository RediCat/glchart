import THREE from 'three';
import {RenderableNode} from "./RenderableNode";
import {RenderableUtils} from "./RenderableUtils";

class SceneNode extends RenderableNode
{
	constructor(dimensions)
	{
		super();
		let required = ['left', 'top', 'width', 'height'];
		this.dimensions = RenderableUtils.CreateOptions(dimensions, required, 'SceneNode.dimensions');
	}
}

export {SceneNode};