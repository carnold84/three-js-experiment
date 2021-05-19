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
      const elContent = this.$refs.content;

      // cache the content size
      const height = window.innerHeight;
      const width = window.innerWidth;

      // create the renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(width, height);

      // add the renderers canvas element to main content div
      elContent.append(this.renderer.domElement);

      // create the scene
      this.scene = new THREE.Scene();

      // add a camera
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

      // set camera position
      this.camera.position.y = 0;
      this.camera.position.z = 400;

      this.elementService = new ElementService({
        camera: this.camera,
        height,
        width,
      });

      // add the camera
      this.scene.add(this.camera);

      const light = new THREE.DirectionalLight(0xffffff, 1);

      light.position.set(2, 1, 5);

      // add the light
      this.scene.add(light);

      // start rendering
      this.render();
    },
    onDocumentMouseDown(evt) {
      // prevent default action
      evt.preventDefault();

      const element = this.elementService.createElement({
        type: ElementService.TYPES.CUBE,
        x: evt.clientX,
        y: evt.clientY,
      });

      // finally add the threejs group to the scene
      this.scene.add(element);
    },
    render() {
      // start animation/render loop
      requestAnimationFrame(this.render);

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
