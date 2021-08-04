<template>
  <div class="link-diagram-container">
    <link-diagram
      :links="links"
      :nodes="nodes"
      :onNodeSelect="onNodeSelect"
      :sizeNodesBy="sizeNodesBy"
    />
  </div>
  <div class="controls-container">
    <controls
      :nodeData="nodeData"
      @sizeNodesBy="onSizeNodesBy"
      :sizeNodesBy="sizeNodesBy"
      :sizeNodesByOptions="sizeNodesByOptions"
    />
  </div>
</template>

<script>
  import { defineAsyncComponent } from 'vue';
  import AppLoading from './components/AppLoading.vue';

  const sizeNodesByOptions = [
    {
      label: 'Count 1',
      value: 'count1',
    },
    {
      label: 'Count 2',
      value: 'count2',
    },
  ];

  export default {
    name: 'App',
    components: {
      Controls: defineAsyncComponent({
        loader: () =>
          import(
            './components/Controls.vue' /* webpackChunkName: 'controls' */
          ),
        loadingComponent: AppLoading,
      }),
      LinkDiagram: defineAsyncComponent({
        loader: () =>
          import(
            './components/LinkDiagram.vue' /* webpackChunkName: 'linkDiagram' */
          ),
        loadingComponent: AppLoading,
      }),
    },
    data() {
      return {
        links: null,
        nodes: null,
        nodeData: null,
        sizeNodesByOptions,
        sizeNodesBy: sizeNodesByOptions[0].value,
      };
    },
    methods: {
      onNodeSelect(data) {
        this.nodeData = data;
      },
      onSizeNodesBy(value) {
        this.sizeNodesBy = value;
      },
    },
    mounted() {
      const links = [];
      const nodes = [];
      const colors = ['#609DC9', '#AA60C9', '#C96060', '#B7AE5C'];

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

      this.links = links;
      this.nodes = nodes;
    },
  };
</script>

<style scoped>
  .link-diagram-container {
    z-index: 0;
  }

  .controls-container {
    display: flex;
    justify-content: flex-end;
    min-height: 30px;
    min-width: 150px;
    position: absolute;
    right: 30px;
    top: 30px;
    z-index: 1;
  }
</style>

<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    background-color: #222222;
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 14px;
    font-weight: 300;
  }
</style>
