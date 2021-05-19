import * as THREE from "three";
import Element3D from "./Element3D";

class Sphere extends Element3D {
  constructor({
    color = 0xffffff,
    heightSegments,
    position,
    radius,
    widthSegments,
  }) {
    super();

    // create the geometry and material for the mesh
    this.geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
    this.material = new THREE.MeshPhongMaterial({ color });

    // create the cube
    this.el = new THREE.Mesh(this.geometry, this.material);

    // store position
    this.position = position;

    // set position
    this.el.position.set(this.position.x, this.position.y, this.position.z);
  }
}

export default Sphere;
