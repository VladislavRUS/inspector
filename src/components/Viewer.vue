<template>
  <div class="viewer" v-if="tree">
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

    <div class="viewer__export-preview" v-if="this.$store.state.layerImagePath">
      <export-preview></export-preview>
    </div>
  </div>
</template>

<script>

import CanvasPreview from './CanvasPreview';
import Hierarchy from './Hierarchy';
import ExportPreview from './ExportPreview';

export default {
  name: 'Viewer',
  components: { ExportPreview, CanvasPreview, Hierarchy },
  data() {
    return {
      imagePath: this.$store.state.imagePath,
      tree: this.$store.state.tree,
    };
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
    position: relative;

    &__hierarchy {
      position: absolute;
      left: 20px;
      top: 100px;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
    }

    &__canvas-preview {
      position: absolute;
      left: 50%;
      top: 100px;
      transform: translateX(-50%);
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
    }

    &__export-preview {
      position: absolute;
      top: 100px;
      right: 20px;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
    }
  }
</style>
