<template>
    <div class="canvas-preview">
      <color-picker
        v-if="isColorPickerVisible"
        :x="colorPickerCoords.x"
        :y="colorPickerCoords.y"
        :imageData="imageData"
        :w="colorPickerSize.width"
        :h="colorPickerSize.height"></color-picker>
      <div class="canvas-preview__wrapper" v-bind:style="wrapperStyle">
        <canvas id="preview-canvas"></canvas>
        <canvas id="draw-canvas" v-bind:class="{'_color-picker': mode === 'color-picker'}"></canvas>
      </div>
    </div>
</template>

<script>

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
      previewCanvas: null,
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
  },
  mounted() {
    const previewCanvas = document.getElementById('preview-canvas');
    this.previewCanvas = previewCanvas;
    const drawCanvas = document.getElementById('draw-canvas');
    this.fitToContainer(previewCanvas);
    this.fitToContainer(drawCanvas);
    const previewCtx = previewCanvas.getContext('2d');
    this.drawCtx = drawCanvas.getContext('2d');

    const image = new Image();

    image.src = `/${this.imagePath}`;
    image.onload = () => previewCtx.drawImage(
      image,
      0,
      0,
      this.width,
      this.height);

    const getCoordinates = (event) => {
      const rect = drawCanvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    drawCanvas.addEventListener('mousemove', (event) => {
      if (this.mode === Modes.SELECT_MODE) {
        const currentHoverLayer =
          getCurrentLayer(this.$store.state.plainList, getCoordinates(event));
        this.$store.commit('saveCurrentHoverLayerId', { id: currentHoverLayer.id });
      } else if (this.mode === Modes.COLOR_PICKER_MODE) {
        const { x, y } = getCoordinates(event);
        this.colorPickerCoords.x = x;
        this.colorPickerCoords.y = y;
        const context = this.previewCanvas.getContext('2d');
        this.imageData = context.getImageData(x - (this.colorPickerSize.width/4), y - (this.colorPickerSize.height/4), this.colorPickerSize.width, this.colorPickerSize.height);
      }
    });

    drawCanvas.addEventListener('mouseenter', (event) => {
      if (this.isColorPickerMode) {
        this.isColorPickerVisible = true;
      }
    });

    drawCanvas.addEventListener('mouseleave', () => {
      this.$store.commit('saveCurrentHoverLayerId', { id: null });
      // this.isColorPickerVisible = false;
    });

    drawCanvas.addEventListener('click', (event) => {
      if (this.$store.state.mode === Modes.SELECT_MODE) {
        const currentClickedLayer =
          getCurrentLayer(this.$store.state.plainList, getCoordinates(event));
        this.$store.commit('saveCurrentClickedLayerId', { id: currentClickedLayer.id });

        if (currentClickedLayer.type === 'layer') {
          this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
        }
      } else if (this.$store.state.mode === Modes.COLOR_PICKER_MODE) {
        const { x, y } = getCoordinates(event);
        const data = previewCtx.getImageData(x, y, 1, 1).data;
        const hex = `#000000${this.rgbToHex(data[0], data[1], data[2])}`.slice(-6);
        this.$store.commit('saveCurrentClickedLayerId', { id: null });
        this.$store.commit('saveCurrentClickedColor', { color: hex });
      }

    });

    this.loop();
  },

  methods: {
    rgbToHex(r, g, b) {
      return ((r << 16) | (g << 8) | b).toString(16);
    },
    fitToContainer(canvas) {
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    },
    loop() {
      this.drawCtx.clearRect(0, 0, this.width, this.height);

      if (this.mode === 'select') {
        if (this.$store.state.currentHoverLayerId) {
          const layer =
            this.$store.state.plainList.find(
              item => item.id === this.$store.state.currentHoverLayerId);

          this.draw(layer);
        }

        if (this.$store.state.currentClickedLayerId) {
          const layer =
            this.$store.state.plainList.find(
              item => item.id === this.$store.state.currentClickedLayerId);

          this.draw(layer);
        }
      }
      requestAnimationFrame(this.loop);
    },
    draw(child) {
      const x = child.left;
      const y = child.top;
      const width = child.right - x;
      const height = child.bottom - y;

      this.drawCtx.beginPath();
      this.drawCtx.rect(x, y, width, height);
      this.drawCtx.strokeStyle = '#41f4cd'; // eslint-disable-line
      this.drawCtx.lineWidth = 2; // eslint-disable-line
      this.drawCtx.stroke();
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
