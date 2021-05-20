<template>
  <div class="fullscreen stage">
    <div class="fullscreen loading" v-show="loading">Initialising...</div>
    <div
      @mousedown="onDocumentMouseDown"
      class="content fullscreen"
      ref="content"
      v-show="!loading"
    ></div>
  </div>
</template>

<script>
import * as THREE from "three";
import * as d3 from "d3";
import ElementService from "../utils/ElementService";

export default {
  name: "Stage",
  data() {
    return {
      loading: true,
      elementType: ElementService.TYPES.SPHERE,
    };
  },
  methods: {
    init() {
      // cache the content size
      const height = window.innerHeight;
      const width = window.innerWidth;

      // create renderer, camera, light etc
      this.setup({
        containerEl: this.$refs.content,
        height,
        width,
      });

      this.elementService = new ElementService({
        camera: this.camera,
        height,
        width,
      });

      this.data = {
        links: [],
        nodes: [],
      };
      for (let i = 0; i < 100; i++) {
        this.data.nodes.push({
          id: i,
          name: `Node ${i + 1}`,
        });
      }
      for (let i = 0; i < 90; i++) {
        this.data.links.push({
          id: i,
          source: this.data.nodes[Math.floor(Math.random() * 100)],
          target: this.data.nodes[Math.floor(Math.random() * 100)],
        });
      }

      console.log(this.data);

      // start rendering
      //this.render();

      this.data.nodes.forEach((node) => {
        const element = this.elementService.createElement({
          type: ElementService.TYPES.SPHERE,
          x: node.x,
          y: node.y,
        });
        node.element = element;

        this.scene.add(element.getEl());
      });

      this.data.links.forEach((link) => {
        const element = this.elementService.createElement({
          endPoint: link.target.element.getPosition(),
          startPoint: link.source.element.getPosition(),
          type: ElementService.TYPES.LINE,
        });
        link.element = element;

        this.scene.add(element.getEl());
      });

      this.start();
    },
    start() {
      const simulation = d3
        .forceSimulation()
        .force("charge", d3.forceManyBody())
        .force(
          "link",
          d3.forceLink().id((d) => d.id)
        )
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", this.onTick);

      simulation.nodes(this.data.nodes);
      simulation.force("link").links(this.data.links);
      simulation
        .alpha(1)
        .restart()
        .tick();
      this.onTick();

      this.render();
    },
    onTick() {
      this.data.nodes.forEach(({ element, x, y }) => {
        element.setPosition({ x, y, z: 0 });
      });

      this.data.links.forEach(({ element, source, target }) => {
        const endPoint = target.element.getPosition();
        const startPoint = source.element.getPosition();
        console.log("element", element);
        element.setPoints({ endPoint, startPoint });
      });

      this.render();
    },
    setup({ containerEl, height, width }) {
      // create the renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(width, height);

      // add the renderers canvas element to main content div
      containerEl.append(this.renderer.domElement);

      // create the scene
      this.scene = new THREE.Scene();

      // add a camera
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

      // set camera position
      this.camera.position.y = 0;
      this.camera.position.z = 400;

      // add the camera
      this.scene.add(this.camera);

      const light = new THREE.DirectionalLight(0xffffff, 1);

      light.position.set(2, 1, 5);

      // add the light
      this.scene.add(light);
    },
    onDocumentMouseDown(evt) {
      // prevent default action
      evt.preventDefault();

      /* const element = this.elementService.createElement({
        type: ElementService.TYPES.CUBE,
        x: evt.clientX,
        y: evt.clientY,
      });

      // finally add the threejs group to the scene
      this.scene.add(element); */
    },
    render() {
      // start animation/render loop
      //requestAnimationFrame(this.render);

      // render the scene
      this.renderer.render(this.scene, this.camera);
    },
  },
  mounted() {
    this.loading = false;
    this.init();
  },
};
</script>

<style scoped>
.stage {
  background-color: #222222;
}

.fullscreen {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.loading {
  align-items: center;
  color: #cccccc;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  justify-content: center;
}
</style>
