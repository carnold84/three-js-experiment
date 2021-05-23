import * as THREE from "three";
import Line from "../elements/Line";
import Sphere from "../elements/Sphere";

export const createNode = ({ color, radius, x, y, z }) => {
  return new Sphere({
    color,
    heightSegments: 24,
    position: new THREE.Vector3(x, y, z),
    radius,
    widthSegments: 24,
  });
};

export const createLink = ({ color, endPoint, startPoint, width }) => {
  return new Line({
    color,
    endPoint,
    startPoint,
    width,
  });
};
