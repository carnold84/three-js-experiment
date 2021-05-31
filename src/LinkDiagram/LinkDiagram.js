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
  HOVER_COLOR = 0xebd61d;
  SELECTED_COLOR = 0xffffff;
  STAGE_BG_COLOR = 0x222222;

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
    this.hoveredNode;
    this.links = [];
    this.linkLookup = {};
    this.linksData = links;
    this.nodes = [];
    this.nodeLookup = {};
    this.nodesData = nodes;
    this.selectedNode;
    this.sizeNodesBy = sizeNodesBy;
    this.pointer = new THREE.Vector2();

    this.init();

    this.processData();

    // add nodes and links
    this.nodesData.forEach((nodeData) => {
      const node = createNode({
        color: nodeData.color,
        radius: 10,
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        z: nodeData.z || 0,
      });
      node.data = nodeData;
      node.setScale(nodeData.scale);

      // add to lookup and array
      this.nodeLookup[nodeData.id] = node;
      this.nodes.push(node);

      this.scene.add(node);
    });

    this.linksData.forEach((linkData) => {
      //linkData.width = 5 * (linkData._data.bracketIdx * 0.8);

      const link = createLink({
        source: this.nodeLookup[linkData.source.id],
        target: this.nodeLookup[linkData.target.id],
        //width: linkData.width,
      });
      link.data = linkData;

      this.linkLookup[linkData.id] = link;
      this.links.push(link);

      this.scene.add(link);
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
    this.scene.background = new THREE.Color(this.STAGE_BG_COLOR);

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
    layoutNodes({
      links: this.linksData,
      nodes: this.nodesData,
      onTick: this.update,
    });

    this.render();
  };

  update = () => {
    this.nodesData.forEach(({ id, x, y, z }) => {
      const node = this.nodeLookup[id];
      node.setPosition({ x, y, z });
    });

    this.linksData.forEach(({ id }) => {
      const link = this.linkLookup[id];
      const endPoint = link.target.getPosition();
      const startPoint = link.source.getPosition();
      link.setPoints({ endPoint, startPoint });
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
      const focusedElement = intersects[0].object.parent;
      if (
        focusedElement.type === 'node' &&
        this.focusedNode !== focusedElement
      ) {
        if (this.focusedNode) {
          this.focusedNode.setColor(this.focusedNode.currentColor);
        }

        this.focusedNode = focusedElement;
        this.focusedNode.setColor(this.HOVER_COLOR);
        this.el.style.cursor = 'pointer';
      }
    } else {
      if (this.focusedNode) {
        this.focusedNode.setColor(this.focusedNode.currentColor);
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

    this.nodesData.forEach((nodeData) => {
      const value = nodeData[this.sizeNodesBy];

      if (maxValue === undefined) {
        maxValue = value;
      } else if (value > maxValue) {
        maxValue = value;
      }
    });

    this.nodesData.forEach((nodeData) => {
      const value = nodeData[this.sizeNodesBy];

      const bracketIdx = Math.ceil((value / maxValue) * numBrackets);

      if (this.cameraType === LinkDiagram.CAMERA_TYPES.PERSPECTIVE) {
        // perspective camera. Change z index
        nodeData.scale = 1;
        nodeData.z = -(50 * (bracketIdx * 0.8) + 100);
      } else {
        // orthographic camera. Change node radius
        nodeData.scale = 0.2 + bracketIdx * 0.08;
        nodeData.z = 0;
      }
    });
  };

  onPointerMove = (evt) => {
    this.pointer.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1;
  };

  onPointerClick = () => {
    const notSelected = this.focusedNode !== this.selectedNode;

    if (this.selectedNode) {
      this.selectedNode.currentColor = this.selectedNode.color;
      this.selectedNode.setColor(this.selectedNode.color);
      this.selectedNode = null;
    }
    console.log(this.focusedNode);

    if (this.focusedNode && notSelected) {
      this.selectedNode = this.focusedNode;
      this.selectedNode.currentColor = this.SELECTED_COLOR;
      this.selectedNode.setColor(this.selectedNode.currentColor);
    }
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
