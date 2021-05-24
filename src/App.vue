<template>
  <link-diagram :sizeNodesBy="sizeNodesBy" />
  <controls
    @sizeNodesBy="onSizeNodesBy"
    :sizeNodesBy="sizeNodesBy"
    :sizeNodesByOptions="sizeNodesByOptions"
  />
</template>

<script>
import Controls from "./components/Controls.vue";
import LinkDiagram from "./components/LinkDiagram.vue";

const sizeNodesByOptions = [
  {
    label: "Count 1",
    value: "count1",
  },
  {
    label: "Count 2",
    value: "count2",
  },
];

export default {
  name: "App",
  components: {
    Controls,
    LinkDiagram,
  },
  data() {
    return {
      sizeNodesByOptions,
      sizeNodesBy: sizeNodesByOptions[0].value,
    };
  },
  methods: {
    onSizeNodesBy(value) {
      console.log(value);
      this.sizeNodesBy = value;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
