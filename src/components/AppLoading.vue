<template>
  <div class="app-loading">
    Loading...
  </div>
</template>

<script>
  export default {
    name: 'app-loading',
  };
</script>

<style scoped>
  .app-loading {
    align-items: center;
    background-color: #222222;
    color: #999999;
    display: flex;
    font-size: 0.9rem;
    height: 100%;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
</style>
