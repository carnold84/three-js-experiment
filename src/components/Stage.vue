<template>
  <div class="fullscreen stage">
    <div class="fullscreen loading" v-show="loading">Initialising...</div>
    <div
      @mousedown="onDocumentMouseDown"
      @mousewheel="onMouseWheel"
      class="content fullscreen"
      ref="content"
      v-show="!loading"
    ></div>
  </div>
</template>

<script>
import LinkDiagram from "../LinkDiagram";

export default {
  name: "Stage",
  data() {
    return {
      loading: true,
    };
  },
  methods: {
    init() {
      const links = [];
      const nodes = [];
      const colors = ["#d56868", "#86bc6b", "#81a8b1", "#d2d52e"];

      for (let i = 0; i < 100; i++) {
        nodes.push({
          color: colors[Math.floor(Math.random() * 3)],
          count: Math.round(Math.random() * 1000),
          id: i,
          name: `Node ${i + 1}`,
        });
      }
      for (let i = 0; i < 90; i++) {
        links.push({
          id: i,
          source: nodes[Math.floor(Math.random() * 100)],
          target: nodes[Math.floor(Math.random() * 100)],
        });
      }

      this.linkDiagram = new LinkDiagram({
        links,
        nodes,
        targetEl: this.$refs.content,
      });
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
