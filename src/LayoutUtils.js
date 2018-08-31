import THREE from 'three';

class LayoutUtils
{
	static SetupCameraPosition(globals, camera)
	{
		let size = globals.chart.size;
		camera.position.add(new THREE.Vector3(size.x / 2, size.y / 2));
	}
}

export {LayoutUtils};