import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as d3 from "d3";

import ElementService from "./utils/ElementService";

class LinkDiagram {
  constructor({ links, nodes, targetEl }) {
    this.el = targetEl;
    this.links = links;
    this.nodes = nodes;

    this.init();

    this.processData();

    // add nodes and links
    this.nodes.forEach((node) => {
      const element = this.elementService.createElement({
        color: node.color,
        radius: 10,
        type: ElementService.TYPES.SPHERE,
        x: node.x,
        y: node.y,
        z: 10 * (node._data.bracketIdx * 0.8),
      });
      node.element = element;

      this.scene.add(element.getEl());
    });

    this.links.forEach((link) => {
      const element = this.elementService.createElement({
        endPoint: link.target.element.getPosition(),
        startPoint: link.source.element.getPosition(),
        type: ElementService.TYPES.LINE,
      });
      link.element = element;

      this.scene.add(element.getEl());
    });

    window.addEventListener("resize", this.onWindowResize);

    this.start();
  }

  init = () => {
    const height = window.innerHeight;
    const width = window.innerWidth;

    // create the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);

    // add the renderers canvas element to main content div
    this.el.append(this.renderer.domElement);

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#e9eae3");

    // add a camera
    /* this.camera = new THREE.OrthographicCamera(
      width / -4,
      width / 4,
      height / 4,
      height / -4,
      1,
      1000
    ); */
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);

    // set camera position
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 1000;

    // add the camera
    this.scene.add(this.camera);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1000);

    this.elementService = new ElementService({
      camera: this.camera,
      height,
      width,
    });

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };
    this.controls.update();

    // add the light
    this.scene.add(light);
  };

  start = () => {
    const simulation = d3
      .forceSimulation()
      .force("charge", d3.forceManyBody())
      .force(
        "link",
        d3.forceLink().id((d) => d.id)
      )
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    simulation.nodes(this.nodes);
    simulation.force("link").links(this.links);
    simulation
      .alpha(1)
      .restart()
      .tick();

    this.render();
  };

  update = () => {
    this.nodes.forEach(({ element, x, y }) => {
      element.setPosition({ x, y, z: 0 });
    });

    this.links.forEach(({ element, source, target }) => {
      const endPoint = target.element.getPosition();
      const startPoint = source.element.getPosition();
      element.setPoints({ endPoint, startPoint });
    });
  };

  processData = () => {
    let numBrackets = 10;
    let maxValue = 1000;
    let minValue;
    const key = "count";

    this.nodes.forEach((node) => {
      const value = node[key];

      if (minValue === undefined) {
        minValue = value;
      } else if (value < minValue) {
        minValue = value;
      }

      if (maxValue === undefined) {
        maxValue = value;
      } else if (value > maxValue) {
        maxValue = value;
      }
    });

    this.nodes.forEach((node) => {
      const value = node[key];

      const bracketIdx = Math.ceil((value / 1000) * numBrackets);

      node._data = {
        bracketIdx,
      };
    });
  };

  render = () => {
    // start animation/render loop
    requestAnimationFrame(this.render);

    this.controls.update();

    this.update();

    // render the scene
    this.renderer.render(this.scene, this.camera);
  };

  onMouseWheel = (evt) => {
    const mouseX = (evt.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(evt.clientY / window.innerHeight) * 2 + 1;
    const vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(this.camera);
    vector.sub(this.camera.position);

    this.controls.target = vector;
  };

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

export default LinkDiagram;
