<template>
  <div class="controls">
    <dropdown
      @select="onSizeNodesBySelect"
      label="Size nodes by"
      :options="sizeNodesByOptions"
      :value="sizeNodesBy"
    />
  </div>
</template>

<script>
import Dropdown from "./Dropdown.vue";

export default {
  components: { Dropdown },
  name: "Controls",
  props: {
    sizeNodesBy: {
      type: String,
    },
    sizeNodesByOptions: {
      type: Array,
    },
  },
  methods: {
    onSizeNodesBySelect(evt) {
      this.$emit("sizeNodesBy", evt.target.value);
    },
  },
};
</script>

<style scoped>
.controls {
  background-color: #333333;
  padding: 20px;
  position: absolute;
  right: 30px;
  top: 30px;
}

.control {
  color: #cccccc;
  display: flex;
  flex-direction: column;
  margin: 0 0 20px;
}
</style>
