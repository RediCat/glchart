import THREE from 'three';
import createLineMesh from 'three-line-2d';
import basic from 'three-line-2d/shaders/basic';
import _ from 'lodash';

const Line = createLineMesh(THREE);
const BasicShader = basic(THREE);

class RenderableUtils
{
	static AssertRequiredFields(obj, requiredFields, objName)
	{
		if (obj === undefined || obj === null || requiredFields === null || requiredFields.length === 0) {
			return;
		}

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

	static CreateOptions(obj, required, objName, defaultOpts)
	{
		RenderableUtils.AssertRequiredFields(obj, required, objName);

		let ret;
		if (obj === undefined || obj === null) {
			ret = {};
		} else {
			ret = ret = _.cloneDeep(obj);
		}

		if (defaultOpts !== undefined && defaultOpts !== null) {
			_.forEach(defaultOpts, (v, k) => {
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