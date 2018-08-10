import loadFont from 'load-bmfont';
import THREE from "three";
import _ from "lodash";

class RenderableUtils
{
	static LoadFont(fontPath, texturePath, onSuccess, onError)
	{
		loadFont(fontPath, (err, font) => {
			if (err) {
				onError(err);
				return;
			}

			let textureOnLoad = (texture) => onSuccess(font, texture);
			let textureOnError = (err) => onError(err);

			new THREE.TextureLoader().load(texturePath, textureOnLoad, undefined, textureOnError);
		});
	}

	static AssertRequiredFields(obj, requiredFields, objName)
	{
		let name = objName;
		if (objName === undefined) {
			name = 'obj';
		}

		_.forEach(requiredFields, (field) => {
			if (!_.has(obj, field)) {
				throw `${name}.${field} was not defined`;
			}
		});
	}
}

export {RenderableUtils};