<template>
    <div class="canvas-preview">
      <color-picker
        v-if="isColorPickerVisible"
        :x="colorPickerCoords.x"
        :y="colorPickerCoords.y"
        :imageData="imageData"
        :w="colorPickerSize.width"
        :h="colorPickerSize.height"/>
      <div class="canvas-preview__wrapper" v-bind:style="wrapperStyle">
        <canvas ref="previewCanvas"></canvas>
        <canvas ref="drawCanvas"
                v-bind:class="{'_color-picker': mode === 'color-picker'}"
                @mousemove="mouseMove"
                @mouseenter="mouseEnter"
                @mouseleave="mouseLeave"
                @click="mouseClick"></canvas>
      </div>
    </div>
</template>

<script>
/* eslint-disable no-param-reassign,no-bitwise */


import ColorPicker from './ColorPicker';
import * as Modes from '../constants/modes';

function getSquare(element) {
  const { top, right, bottom, left } = element;
  const width = right - left;
  const height = bottom - top;
  return width * height;
}

function getCurrentLayer(plainList, mousePosition) {
  const { x, y } = mousePosition;

  if (!x || !y) {
    return null;
  }

  const overLayers = plainList.filter((element) => {
    const { top, right, bottom, left } = element;

    return x >= left && x <= right && y >= top && y <= bottom;
  }).sort((first, second) => getSquare(first) - getSquare(second));

  return overLayers[0];
}

export default {
  name: 'CanvasPreview',
  components: { ColorPicker },
  props: ['imagePath', 'width', 'height'],
  data() {
    return {
      isColorPickerVisible: false,
      colorPickerSize: {
        width: 25,
        height: 25,
      },
      wrapperStyle: {
        width: `${this.width}px`,
        height: `${this.height}px`,
      },
      previewCanvasCtx: null,
      drawCanvasCtx: null,
      colorPickerCoords: {
        x: 0,
        y: 0,
      },
      imageData: null,
    };
  },
  computed: {
    mode() {
      return this.$store.state.mode;
    },
    isColorPickerMode() {
      return this.mode === Modes.COLOR_PICKER_MODE;
    },
    isSelectMode() {
      return this.mode === Modes.SELECT_MODE;
    },
    isMeasureMode() {
      return this.mode === Modes.MEASURE_MODE;
    },
  },
  mounted() {
    const previewCanvas = this.$refs.previewCanvas;
    const drawCanvas = this.$refs.drawCanvas;

    this.fitToContainer(previewCanvas);
    this.fitToContainer(drawCanvas);

    this.previewCanvasCtx = previewCanvas.getContext('2d');
    this.drawCanvasCtx = drawCanvas.getContext('2d');

    this.drawImage();

    this.loop();
  },

  methods: {
    drawImage() {
      const image = new Image();

      image.src = `/${this.imagePath}`;
      image.onload = () => this.previewCanvasCtx.drawImage(
        image,
        0,
        0,
        this.width,
        this.height);
    },
    rgbToHex(r, g, b) {
      return ((r << 16) | (g << 8) | b).toString(16);
    },
    fitToContainer(canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    },
    getCoordinates(event) {
      const rect = this.$refs.drawCanvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    mouseMove(event) {
      if (this.isSelectMode || this.isMeasureMode) {
        const currentHoverLayer =
          getCurrentLayer(this.$store.state.plainList, this.getCoordinates(event));
        this.$store.commit('saveCurrentHoverLayerId', { id: currentHoverLayer.id });
      } else if (this.isColorPickerMode) {
        const { x, y } = this.getCoordinates(event);
        this.colorPickerCoords.x = x;
        this.colorPickerCoords.y = y;
        this.imageData = this.previewCanvasCtx
          .getImageData(
            x - (this.colorPickerSize.width / 4),
            y - (this.colorPickerSize.height / 4),
            this.colorPickerSize.width,
            this.colorPickerSize.height);
      }
    },
    mouseEnter() {
      if (this.isColorPickerMode) {
        this.isColorPickerVisible = true;
      }
    },
    mouseLeave() {
      this.$store.commit('saveCurrentHoverLayerId', { id: null });

      if (this.isColorPickerMode) {
        this.isColorPickerVisible = false;
      }
    },
    mouseClick(event) {
      if (this.isSelectMode || this.isMeasureMode) {
        const currentClickedLayer =
          getCurrentLayer(this.$store.state.plainList, this.getCoordinates(event));
        this.$store.commit('saveCurrentClickedLayerId', { id: currentClickedLayer.id });

        if (currentClickedLayer.type === 'layer') {
          this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
        }
      } else if (this.isColorPickerMode) {
        const { x, y } = this.getCoordinates(event);
        const data = this.previewCanvasCtx.getImageData(x, y, 1, 1).data;
        const hex = `#000000${this.rgbToHex(data[0], data[1], data[2])}`.slice(-6);
        this.copyColor(`#${hex}`);
      }
    },
    copyColor(value) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.display = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      this.$toasted.show(`Copied: ${value}`, {
        className: 'toast-custom',
        position: 'bottom-right',
        duration: 2000,
      });
      document.body.removeChild(textarea);
    },
    loop() {
      this.drawCanvasCtx.clearRect(0, 0, this.$refs.drawCanvas.width, this.$refs.drawCanvas.height);

      const currentHoverLayer = this.$store.getters.currentHoverLayer;
      const currentClickedLayer = this.$store.getters.currentClickedLayer;

      if (this.isSelectMode || this.isMeasureMode) {
        this.draw(currentHoverLayer);
        this.draw(currentClickedLayer);
      }

      if (this.isMeasureMode) {

      }

      requestAnimationFrame(this.loop);
    },
    draw(child) {
      if (!child) {
        return;
      }

      const x = child.left;
      const y = child.top;
      const width = child.right - x;
      const height = child.bottom - y;

      this.drawCanvasCtx.beginPath();
      this.drawCanvasCtx.rect(x, y, width, height);
      this.drawCanvasCtx.strokeStyle = '#41f4cd'; // eslint-disable-line
      this.drawCanvasCtx.lineWidth = 2; // eslint-disable-line
      this.drawCanvasCtx.stroke();
    },
  },
};
</script>

<style lang="less" scoped>
  .canvas-preview {
    position: relative;

    &__wrapper {
      width: 100%;
      height: 100%;
      position: relative;
    }

    & ._color-picker {
      width: 50px;
      height: 50px;
    }
  }

  canvas {
    display: block;
    position: absolute;

    &._color-picker {
      cursor: crosshair;
    }
  }


</style>
