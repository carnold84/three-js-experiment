import * as THREE from "three";
import Element3D from "./Element3D";

class Cube extends Element3D {
  constructor({ color = 0xffffff, depth, height, position, width }) {
    super();

    // create the geometry and material for the mesh
    this.geometry = new THREE.BoxGeometry(width, height, depth);
    this.material = new THREE.MeshPhongMaterial({ color });

    // create the cube
    this.el = new THREE.Mesh(this.geometry, this.material);

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
}

export default Cube;
