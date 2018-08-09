<template>
  <div class="viewer">
    <div class="viewer__hierarchy">
      <hierarchy></hierarchy>
    </div>

    <div class="viewer__canvas-preview">
        <canvas-preview
          :imagePath="imagePath"
          :width="tree.document.width"
          :height="tree.document.height">
        </canvas-preview>
    </div>

    <div class="viewer__export-preview" v-if="appropriateMode">
      <export-preview></export-preview>
    </div>
  </div>
</template>

<script>


import CanvasPreview from './CanvasPreview';
import Hierarchy from './Hierarchy';
import ExportPreview from './ExportPreview';
import * as Modes from '../constants/modes';

export default {
  name: 'Viewer',
  components: { ExportPreview, CanvasPreview, Hierarchy },
  data() {
    return {
      imagePath: this.$store.state.imagePath,
      tree: this.$store.state.tree,
    };
  },
  computed: {
    appropriateMode() {
      return this.$store.state.mode === Modes.SELECT_MODE ||
      this.$store.state.mode === Modes.MEASURE_MODE;
    },
  },
  beforeCreate() {
    if (!this.$store.state.imagePath) {
      this.$router.push('/');
    }
  },
};
</script>

<style lang="less" scoped>
  .viewer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    &__hierarchy {
      position: absolute;
      left: 20px;
      top: 100px;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }

    &__canvas-preview {
      position: relative;
      display: flex;
      justify-content: center;
      top: 100px;
      width: 100%;
      height: 100%;
    }

    &__export-preview {
      position: absolute;
      top: 100px;
      right: 20px;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
  }
</style>
