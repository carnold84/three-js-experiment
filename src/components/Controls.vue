<template>
  <div class="controls">
    <!-- <div class="control">
      <dropdown
      @select="onSizeNodesBySelect"
      label="Size nodes by"
      :options="sizeNodesByOptions"
      :value="sizeNodesBy"
    />
    </div> -->
    <div class="control">
      <div v-if="nodeData" class="info">
        <p class="info-name">{{ nodeData?.name }}</p>
        <ul class="info-list">
          <li v-for="(value, name) in nodeValues" :key="name">
            <span>{{ name }}:</span> {{ value }}
          </li>
        </ul>
      </div>
      <p v-else class="message">No node is selected</p>
    </div>
  </div>
</template>

<script>
  //import Dropdown from './Dropdown.vue';

  export default {
    components: {
      //Dropdown
    },
    name: 'Controls',
    props: {
      nodeData: {
        type: Object,
      },
      sizeNodesBy: {
        type: String,
      },
      sizeNodesByOptions: {
        type: Array,
      },
    },
    computed: {
      nodeValues() {
        if (this.nodeData) {
          let values = {
            ...this.nodeData,
          };

          for (let key in values) {
            if (key !== 'count1' && key !== 'count2') {
              delete values[key];
            }
          }

          return values;
        }

        return undefined;
      },
    },
    methods: {
      onSizeNodesBySelect(evt) {
        this.$emit('sizeNodesBy', evt.target.value);
      },
    },
  };
</script>

<style scoped>
  .controls {
    background-color: rgba(36, 36, 36, 0.6);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(72, 72, 72, 0.6);
    max-width: 300px;
    min-width: 200px;
    padding: 20px;
    width: 100%;
  }

  .control {
    color: #cccccc;
    display: flex;
    flex-direction: column;
    margin: 0 0 20px;
  }

  .control:last-child {
    margin: 0;
  }

  .control .title {
    font-size: 1.1rem;
    margin: 0 0 10px;
  }

  .message {
    font-size: 1rem;
    margin: 0;
  }

  .info-name {
    font-size: 1rem;
    margin: 0 0 8px;
  }

  .info-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .info-list li {
    margin: 0 0 4px;
    padding: 0;
  }

  .info-list li span {
    color: #aaaaaa;
  }
</style>
