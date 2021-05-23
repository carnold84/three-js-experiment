import * as THREE from "three";
import Element3D from "./Element3D";

class Line extends Element3D {
  constructor({ color = 0xffffff, endPoint, startPoint, width = 2 }) {
    super();

    const points = [startPoint, endPoint];

    // create the geometry and material for the line
    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, linewidth: width });

    // create the cube
    this.el = new THREE.Line(this.geometry, material);
  }

  setPoints = ({ startPoint, endPoint }) => {
    this.geometry.setFromPoints([startPoint, endPoint]);
  };
}

export default Line;
