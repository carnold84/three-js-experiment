<template>
  <div class="fullscreen link-diagram">
    <div class="fullscreen loading" v-show="loading">Initialising...</div>
    <div class="content fullscreen" ref="content" v-show="!loading"></div>
  </div>
</template>

<script>
  import LinkDiagram from '../LinkDiagram';

  export default {
    name: 'LinkDiagram',
    data() {
      return {
        loading: true,
      };
    },
    props: {
      links: {
        type: Array,
      },
      nodes: {
        type: Array,
      },
      onNodeSelect: {
        type: Function,
      },
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
        if (this.loading === true && this.nodes && this.links) {
          this.loading = false;

          this.linkDiagram = new LinkDiagram({
            links: this.links,
            nodes: this.nodes,
            onNodeSelect: this.onNodeSelect,
            sizeNodesBy: this.sizeNodesBy,
            targetEl: this.$refs.content,
          });
        }
      },
    },
    mounted() {
      this.init();
    },
    updated() {
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
