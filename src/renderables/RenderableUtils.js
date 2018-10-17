import THREE from 'three';
import createLineMesh from 'three-line-2d';
import basic from 'three-line-2d/shaders/basic';
import {MeshLine, MeshLineMaterial} from 'three.meshline';
import _ from 'lodash';
import crypto from 'crypto';

const Line = createLineMesh(THREE);
const BasicShader = basic(THREE);

class RenderableUtils {
	static AssertRequiredFields(obj, requiredFields, objName) {
		if (
			obj === undefined ||
			obj === null ||
			requiredFields === null ||
			requiredFields.length === 0
		) {
			return;
		}

		let name = objName;
		if (objName === undefined) {
			name = 'obj';
		}

		_.forEach(requiredFields, field => {
			if (!_.has(obj, field)) {
				throw `${name}.${field} was not defined`;
			}
		});
	}

	static CreateOptions(obj, required, objName, defaultOpts) {
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

	static CreateLine(verts, color, thickness) {
		if (thickness === undefined || thickness === null) {
			thickness = 1;
		}

		let geometry = Line(verts);

		let shaderMat = new THREE.ShaderMaterial(
			BasicShader({
				side: THREE.DoubleSide,
				diffuse: color,
				thickness: thickness
			})
		);

		return new THREE.Mesh(geometry, shaderMat);
	}

	static CreateLineV2(verts, color, thickness) {
        if (thickness === undefined || thickness === null) {
			thickness = 1;
        }
        
        let material = new MeshLineMaterial({
            color: new THREE.Color(color),
            resolution: new THREE.Vector2(1000, 250),
            lineAttenuation: !false,
            lineWidth: 2,
            useMap: false,
            near: 0,
            far: 10
        });

        let group = new THREE.Group();
        
        for (let index = 0; index < verts.length - 1; index += 1) {
            let geometry = new THREE.Geometry();
            let v1 = verts[index];
            let v2 = verts[index + 1];
            geometry.vertices.push(new THREE.Vector3(v1[0], v2[1], 1));
            geometry.vertices.push(new THREE.Vector3(v2[0], v2[1], 1));

            let line = new MeshLine();
            line.setGeometry(geometry);

            group.add(new THREE.Mesh(line.geometry, material));
        }

        return group;
    }

	static CreateUuid() {
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
			(
				c ^
				(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
			).toString(16)
		);
	}

	static AddEvent(obj, type, cb) {
		if (obj == null || typeof obj == undefined) return;
		if (obj.addEventListener) {
			obj.addEventListener(type, cb, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + type, cb);
		} else {
			obj['on' + type] = cb;
		}
	}

    static BinarySearch (arr, val, useFloor) {
        let left = 0;
        let right = arr.length - 1;
    
        while (left <= right) {
            const mid = left + Math.floor((right - left) / 2);
    
            if (arr[mid] === val) {
                return mid;
            }
    
            if (arr[mid] < val) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    
        if (val < arr[right] && arr[right - 1] < val) {
            return (useFloor) ? right - 1 : right;
        }
    
        if (val < arr[left] && arr[left - 1] < val) {
            return (useFloor) ? left - 1 : left;
        }
    
        return -1;
    }

	static GetElementInfo(element) {
		let elementInfo = null;
		if (element !== '') {
			let foundElement = document.querySelector(element);
			if (foundElement !== null) {
				elementInfo = {
					element: foundElement,
					size: new THREE.Vector2(
						foundElement.clientWidth,
						foundElement.clientHeight
					)
				};
			}
		}
		return elementInfo;
	}

	static Lerp(a, b, t) {
		t = t < 0 ? 0 : t;
		t = t > 1 ? 1 : t;
		return a + (b - a) * t;
	}
}

export {RenderableUtils};
