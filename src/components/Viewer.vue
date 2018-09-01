<template>
  <div class="viewer">
    <div class="viewer__hierarchy">
      <hierarchy></hierarchy>
    </div>

    <div class="viewer__color-picker" v-if="isColorPickerMode">
      <color-picker/>
    </div>

    <div class="viewer__canvas-preview">
        <canvas-preview
          :imagePath="imagePath"
          :width="tree.document.width"
          :height="tree.document.height">
        </canvas-preview>
    </div>

    <div class="viewer__export-preview">
      <export-preview></export-preview>
    </div>
  </div>
</template>

<script>


import CanvasPreview from './CanvasPreview';
import ColorPicker from './ColorPicker';
import Hierarchy from './Hierarchy';
import ExportPreview from './ExportPreview';
import * as Modes from '../constants/modes';

export default {
  name: 'Viewer',
  components: { ExportPreview, CanvasPreview, Hierarchy, ColorPicker },
  data() {
    return {
      imagePath: this.$store.state.imagePath,
      tree: this.$store.state.tree,
    };
  },
  computed: {
    isColorPickerMode() {
      return this.$store.state.mode === Modes.COLOR_PICKER_MODE
    },
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
    top: 50px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__hierarchy {
      position: absolute;
      left: 0;
      top: 0px;
      bottom: 0;
      box-shadow: 0 1 10px -2px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }

    &__canvas-preview {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 250px;
      right: 250px;
    }

    &__export-preview {
      position: absolute;
      top: 0px;
      bottom: 0;
      right: 0;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
  }
</style>
