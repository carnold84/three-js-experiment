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
    this.material = new THREE.MeshBasicMaterial({ color });

    // create the cube
    this.el = new THREE.Group();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.add(this.mesh);

    // store position
    this.position = position;

    // set position
    this.el.position.set(this.position.x, this.position.y, this.position.z);
  }

  getPosition = () => {
    return this.el.position;
  };

  setPosition = ({ x, y, z }) => {
    this.el.position.set(x, y, z);
  };

  setScale = (scale) => {
    this.geometry.scale(scale, scale, scale);
  };
}

export default Sphere;
