import loadFont from 'load-bmfont';
import THREE from 'three';
import createLineMesh from 'three-line-2d';
import basic from 'three-line-2d/shaders/basic';
import _ from 'lodash';

const Line = createLineMesh(THREE);
const BasicShader = basic(THREE);

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

	static CreateOptions(obj, required, objName, defaults)
	{
		RenderableUtils.AssertRequiredFields(obj, required, objName);
		let ret = _.cloneDeep(obj);
		if (defaults !== undefined && defaults !== null) {
			_.forEach(defaults, (v, k) => {
				ret[k] = _.get(obj, k, v);
			});
		}
		return ret;
	}

	static CreateLine(verts, color, thickness)
	{
		if (thickness === undefined || thickness === null) {
			thickness = 1;
		}

		let geometry = Line(verts, { distances: true });

		let shaderMat = new THREE.ShaderMaterial(BasicShader({
			side: THREE.DoubleSide,
			diffuse: color,
			thickness: thickness
		}));

		return new THREE.Mesh(geometry, shaderMat);
	}
}

export {RenderableUtils};