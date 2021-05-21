class Element3D {
  getEl = () => {
    return this.el;
  };

  setRotationInDegrees = (x, y, z) => {
    this.el.rotation.x = (Math.PI * x) / 180;
    this.el.rotation.y = (Math.PI * y) / 180;
    this.el.rotation.z = (Math.PI * z) / 180;
  };
}

export default Element3D;
