<template>
  <div class="viewer">
    <canvas-preview
      :imagePath="imagePath"
      :width="tree.document.width"
      :height="tree.document.height">
    </canvas-preview>
  </div>
</template>

<script>

import CanvasPreview from './CanvasPreview';

export default {
  name: 'Viewer',
  components: { CanvasPreview },
  data() {
    return {
      imagePath: this.$store.state.imagePath,
      tree: this.$store.state.tree,
    };
  },
};
</script>

<style lang="less" scoped>

</style>
