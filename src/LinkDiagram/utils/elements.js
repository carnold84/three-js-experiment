import * as THREE from 'three';

export const createNode = ({ color, radius, x, y, z }) => {
  const heightSegments = 24;
  const widthSegments = 24;

  console.log(x, y, z);

  // create the geometry and material for the mesh
  const geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );
  const material = new THREE.MeshBasicMaterial({ color });

  // create the cube
  const node = new THREE.Group();
  const mesh = new THREE.Mesh(geometry, material);
  node.geometry = geometry;
  node.material = material;
  node.mesh = mesh;
  node.add(mesh);

  // set position
  node.position.set(x, y, z);
  node.color = color;
  node.currentColor = color;
  node.type = 'node';

  node.setScale = function(scale) {
    this.mesh.geometry.scale(scale, scale, scale);
  };

  node.getPosition = function() {
    return this.position;
  };

  node.setPosition = function({ x, y, z = 0 }) {
    this.position.set(x, y, z);
  };

  node.setColor = function(color) {
    this.material.color.set(color);
  };

  node.isSelected = false;

  return node;
};

export const createLink = ({ color = 0xffffff, source, target, width = 2 }) => {
  const points = [source.getPosition(), target.getPosition()];

  // create the geometry and material for the line
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, linewidth: width });

  const link = new THREE.Line(geometry, material);
  link.geometry = geometry;
  link.material = material;
  link.source = source;
  link.target = target;
  link.type = 'link';

  link.setPoints = function({ startPoint, endPoint }) {
    this.geometry.setFromPoints([startPoint, endPoint]);
  };

  // create the line
  return link;
};
