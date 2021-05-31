import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as d3 from 'd3';
import { createLink, createNode } from './utils/elements';

const layoutNodes = ({ links, nodes, onTick }) => {
  const simulation = d3
    .forceSimulation()
    .force('charge', d3.forceManyBody())
    .force(
      'link',
      d3.forceLink().id((d) => d.id)
    )
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .on('tick', onTick);

  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation
    .alpha(1)
    .restart()
    .tick();
};

class LinkDiagram {
  static CAMERA_TYPES = {
    ORTHOGRAPHIC: 'orthographic',
    PERSPECTIVE: 'perspective',
  };

  constructor({
    cameraType = LinkDiagram.CAMERA_TYPES.ORTHOGRAPHIC,
    links,
    nodes,
    sizeNodesBy,
    targetEl,
  }) {
    this.cameraType = cameraType;
    this.el = targetEl;
    this.frustumSize = 1000;
    this.links = links;
    this.nodes = nodes;
    this.sizeNodesBy = sizeNodesBy;
    this.pointer = new THREE.Vector2();

    this.init();

    this.processData();

    // add nodes and links
    this.nodes.forEach((node) => {
      const element = createNode({
        color: node.color,
        radius: 10,
        x: node.x,
        y: node.y,
        z: node.z,
      });
      element.setScale(node.scale);
      node.element = element;

      this.scene.add(element.getEl());
    });

    this.links.forEach((link) => {
      //link.width = 5 * (link._data.bracketIdx * 0.8);

      const element = createLink({
        endPoint: link.target.element.getPosition(),
        startPoint: link.source.element.getPosition(),
        //width: link.width,
      });
      link.element = element;

      this.scene.add(element.getEl());
    });

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('click', this.onPointerClick);
    window.addEventListener('resize', this.onWindowResize);

    this.start();
  }

  init = () => {
    const height = window.innerHeight;
    const width = window.innerWidth;

    this.raycaster = new THREE.Raycaster();

    // create the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);

    // add the renderers canvas element to main content div
    this.el.append(this.renderer.domElement);

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#222222');

    // add a camera
    if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
      this.camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        1,
        this.frustumSize
      );
    } else {
      const aspect = window.innerWidth / window.innerHeight;
      this.camera = new THREE.OrthographicCamera(
        (this.frustumSize * aspect) / -5,
        (this.frustumSize * aspect) / 5,
        this.frustumSize / 5,
        this.frustumSize / -5,
        1,
        1000
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

    this.controls.update();

    // add the light
    this.scene.add(light);
  };

  start = () => {
    layoutNodes({ links: this.links, nodes: this.nodes, onTick: this.update });

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
    //this.update();

    this.controls.update();

    // find intersections

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // use true to intersect all children of children (recursive)
    // i.e. the sphere as well as the group
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      if (this.focusedNode != intersects[0].object) {
        if (this.focusedNode) {
          this.focusedNode.material.color.set(this.focusedNode.currentColor);
        }

        this.focusedNode = intersects[0].object;
        this.focusedNode.currentColor = this.focusedNode.material.color.getHex();
        this.focusedNode.material.color.set(0xebd61d);
        this.el.style.cursor = 'pointer';
      }
    } else {
      if (this.focusedNode) {
        this.focusedNode.material.color.set(this.focusedNode.currentColor);
      }

      this.focusedNode = null;
      this.el.style.cursor = 'auto';
    }

    // start animation/render loop
    requestAnimationFrame(this.render);

    // render the scene
    this.renderer.render(this.scene, this.camera);
  };

  updateNodeSizing = (value) => {
    this.sizeNodesBy = value;
    this.processData();

    this.nodes.forEach(({ element, scale }) => {
      element.setScale(scale);
    });
  };

  processData = () => {
    let numBrackets = 10;
    let maxValue = 1000;

    this.nodes.forEach((node) => {
      const value = node[this.sizeNodesBy];

      if (maxValue === undefined) {
        maxValue = value;
      } else if (value > maxValue) {
        maxValue = value;
      }
    });

    this.nodes.forEach((node) => {
      const value = node[this.sizeNodesBy];

      const bracketIdx = Math.ceil((value / maxValue) * numBrackets);

      if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
        // perspective camera. Change z index
        node.scale = 1;
        node.z = -(50 * (bracketIdx * 0.8) + 100);
      } else {
        // orthographic camera. Change node radius
        node.scale = 0.2 + bracketIdx * 0.08;
        node.z = 0;
      }
    });
  };

  onPointerMove = (evt) => {
    this.pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  };

  onPointerClick = () => {
    if (this.selectedNode) {
      this.selectedNode.material.color.set(0xff00ff);
    }
    if (this.focusedNode) {
      this.focusedNode.material.color.set(0xff00ff);
    }
    console.log(this.focusedNode);
  };

  onWindowResize = () => {
    if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
    } else {
      const aspect = window.innerWidth / window.innerHeight;

      this.camera.left = (-this.frustumSize * aspect) / 5;
      this.camera.right = (this.frustumSize * aspect) / 5;
      this.camera.top = this.frustumSize / 5;
      this.camera.bottom = -this.frustumSize / 5;
    }

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

export default LinkDiagram;
