import THREE from 'three';
import createLineMesh from 'three-line-2d';
import basic from 'three-line-2d/shaders/basic';
import _ from 'lodash';
import crypto from 'crypto';

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

	static CreateUuid()
	{
		return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
	}
}

export {RenderableUtils};