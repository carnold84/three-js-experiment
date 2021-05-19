import * as THREE from "three";
import Cube from "../elements/Cube";
import Sphere from "../elements/Sphere";

class ElementService {
  static CONVERSIONS = {
    DEGREES_IN_RADIAN: 57.3,
    DEGREES_IN_CIRCLE: 360,
    RADIANS_IN_CIRCLE: 360 / 57.3,
  };

  static TYPES = {
    CUBE: "cube",
    SPHERE: "sphere",
  };

  constructor({ camera, height, width }) {
    this.camera = camera;
    this.height = height;
    this.width = width;
  }

  getPosition = ({ x, y }) => {
    // create 3D vector
    const vector = new THREE.Vector3();
    // set vector values
    vector.set((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1, 0.5);
    // get ray pointing in right direction
    vector.unproject(this.camera);

    const dir = vector.sub(this.camera.position).normalize();

    const distance = -this.camera.position.z / dir.z;

    return this.camera.position.clone().add(dir.multiplyScalar(distance));
  };

  createCube = ({ x, y }) => {
    return this.createElement({ type: ElementService.TYPES.CUBE, x, y });
  };

  createSphere = ({ x, y }) => {
    return this.createElement({ type: ElementService.TYPES.SPHERE, x, y });
  };

  createElement = ({ type, x, y }) => {
    let element;

    const position = this.getPosition({ x, y });

    // create element depending on element type
    switch (type) {
      case ElementService.TYPES.CUBE:
        element = new Cube({
          width: 10,
          height: 10,
          depth: 50,
          colour: 0xffffff,
          position,
        });

        break;

      case ElementService.TYPES.SPHERE:
        element = new Sphere({
          color: 0xffffff,
          heightSegments: 24,
          position,
          radius: 10,
          widthSegments: 24,
        });

        break;
    }

    return element.getEl();
  };

  createSphereRing = ({ radius, x, y }) => {
    let i = 0,
      num_elements = 8,
      element,
      group = new THREE.Object3D(),
      angle;

    for (i; i < num_elements; i++) {
      angle =
        (ElementService.CONVERSIONS.DEGREES_IN_CIRCLE /
          num_elements /
          ElementService.CONVERSIONS.DEGREES_IN_RADIAN) *
        i;

      element = this.createElement({
        type: ElementService.TYPES.SPHERE,
        x: radius * Math.cos(angle) + x,
        y: radius * Math.sin(angle) + y,
      });

      // add a new element at the point of click
      group.add(element.getEl());
    }

    group.position.set(0, 0, Math.random() * 100);

    group.rotation.x =
      Math.random() * ElementService.CONVERSIONS.RADIANS_IN_CIRCLE;

    return group;
  };
}

export default ElementService;
