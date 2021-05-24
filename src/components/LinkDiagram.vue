<template>
  <div class="fullscreen link-diagram">
    <div class="fullscreen loading" v-show="loading">Initialising...</div>
    <div class="content fullscreen" ref="content" v-show="!loading"></div>
  </div>
</template>

<script>
import LinkDiagram from "../LinkDiagram";

export default {
  name: "LinkDiagram",
  data() {
    return {
      loading: true,
    };
  },
  props: {
    sizeNodesBy: {
      type: String,
    },
  },
  watch: {
    sizeNodesBy(val) {
      this.linkDiagram.updateNodeSizing(val);
    },
  },
  methods: {
    async init() {
      const links = [];
      const nodes = [];
      const colors = ["#609DC9", "#AA60C9", "#C96060", "#B7AE5C"];

      for (let i = 0; i < 100; i++) {
        nodes.push({
          color: colors[Math.floor(Math.random() * 4)],
          count1: Math.round(Math.random() * 1000),
          count2: Math.round(Math.random() * 1000),
          id: i,
          name: `Node ${i + 1}`,
        });
      }
      for (let i = 0; i < 90; i++) {
        links.push({
          count1: Math.round(Math.random() * 300),
          count2: Math.round(Math.random() * 300),
          id: i,
          source: nodes[Math.floor(Math.random() * 100)],
          target: nodes[Math.floor(Math.random() * 100)],
        });
      }

      this.loading = false;

      this.linkDiagram = new LinkDiagram({
        links,
        nodes,
        sizeNodesBy: this.sizeNodesBy,
        targetEl: this.$refs.content,
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>
.link-diagram {
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
