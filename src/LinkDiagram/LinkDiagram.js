import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as d3 from "d3";
import { createLink, createNode } from "./utils/elements";

class LinkDiagram {
  static CAMERA_TYPES = {
    ORTHOGRAPHIC: "orthographic",
    PERSPECTIVE: "perspective",
  };
  constructor({
    cameraType = LinkDiagram.CAMERA_TYPES.ORTHOGRAPHIC,
    links,
    nodes,
    targetEl,
  }) {
    this.cameraType = cameraType;
    this.el = targetEl;
    this.frustumSize = 1000;
    this.links = links;
    this.nodes = nodes;

    this.init();

    this.processData();

    // add nodes and links
    this.nodes.forEach((node) => {
      if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
        // perspective camera. Change z index
        node.radius = 10;
        node.z = -(50 * (node._data.bracketIdx * 0.8) + 100);
      } else {
        // orthographic camera. Change node radius
        node.radius = node._data.bracketIdx * 0.8 + 2;
        node.z = 0;
      }

      const element = createNode({
        color: node.color,
        radius: node.radius,
        x: node.x,
        y: node.y,
        z: node.z,
      });
      node.element = element;

      this.scene.add(element.getEl());
    });

    console.log(this.links);

    this.links.forEach((link) => {
      link.width = 5 * (link._data.bracketIdx * 0.8);

      const element = createLink({
        endPoint: link.target.element.getPosition(),
        startPoint: link.source.element.getPosition(),
        width: link.width,
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
    this.scene.background = new THREE.Color("#222222");

    // add a camera
    if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
      this.camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        1,
        this.frustumSize
      );
    } else {
      this.camera = new THREE.OrthographicCamera(
        width / -4,
        width / 4,
        height / 4,
        height / -4,
        1,
        this.frustumSize
      );
    }

    // set camera position
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 250;

    // add the camera
    this.scene.add(this.camera);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1000);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;

    if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
      this.controls.maxDistance = 250;
      this.controls.minDistance = 10;
    } else {
      this.controls.maxZoom = 8;
      this.controls.minZoom = 1;
    }

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.panSpeed = 1;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
    };

    /* this.controls = new MapControls(this.camera, this.renderer.domElement);

    this.controls.panSpeed = 10;
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;

    this.controls.screenSpacePanning = false;

    this.controls.minDistance = 100;
    this.controls.maxDistance = 500; */

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
      .force("y", d3.forceY())
      .on("tick", this.update);

    simulation.nodes(this.nodes);
    simulation.force("link").links(this.links);
    simulation
      .alpha(1)
      .restart()
      .tick();

    this.render();
  };

  update = () => {
    this.nodes.forEach(({ element, x, y, z }) => {
      element.setPosition({ x, y, z });
    });

    this.links.forEach(({ element, source, target }) => {
      const endPoint = target.element.getPosition();
      const startPoint = source.element.getPosition();
      element.setPoints({ endPoint, startPoint });
    });
  };

  render = () => {
    // start animation/render loop
    requestAnimationFrame(this.render);

    //this.update();

    this.controls.update();

    // render the scene
    this.renderer.render(this.scene, this.camera);
  };

  processData = () => {
    let numBrackets = 10;
    let maxValue = 1000;
    let minValue;
    const key = "count1";

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

    this.links.forEach((link) => {
      const value = link[key];

      const bracketIdx = Math.ceil((value / 1000) * numBrackets);

      link._data = {
        bracketIdx,
      };
    });
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
    if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      const aspect = window.innerWidth / window.innerHeight;

      this.camera.left = (-this.frustumSize * aspect) / 2;
      this.camera.right = (this.frustumSize * aspect) / 2;
      this.camera.top = this.frustumSize / 2;
      this.camera.bottom = -this.frustumSize / 2;

      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };
}

export default LinkDiagram;
