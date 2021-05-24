<template>
  <label class="dropdown"
    >{{ label }}
    <select @change="onChange" :value="value">
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        >{{ option.value }}</option
      >
    </select>
  </label>
</template>

<script>
export default {
  name: "Dropdown",
  props: {
    label: {
      type: String,
    },
    options: {
      type: Array,
    },
    value: {
      type: String,
    },
  },
  methods: {
    onChange(evt) {
      evt.preventDefault();
      this.$emit("select", evt);
    },
  },
};
</script>

<style scoped>
.dropdown {
  color: #cccccc;
  display: flex;
  flex-direction: column;
  margin: 0 0 20px;
}
</style>
