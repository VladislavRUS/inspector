<template>
  <div class="viewer" v-if="tree">
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
      return this.$store.state.mode === Modes.COLOR_PICKER_MODE;
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
      left: 10px;
      top: 10px;
      bottom: 10px;
      border: 1px solid #e5e6eb;
      overflow: hidden;
      z-index: 10;
    }

    &__canvas-preview {
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 270px;
      right: 270px;
      border: 1px solid #e5e6eb;
    }

    &__export-preview {
      position: absolute;
      top: 10px;
      bottom: 10px;
      right: 10px;
      border: 1px solid #e5e6eb;
      overflow: hidden;
      z-index: 10;
    }
  }
</style>
