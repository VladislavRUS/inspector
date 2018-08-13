<template>
    <div class="canvas-preview">
      <color-picker
        v-if="isColorPickerVisible"
        :x="colorPickerCoords.x"
        :y="colorPickerCoords.y"
        :imageData="imageData"
        :w="colorPickerSize.width"
        :h="colorPickerSize.height"/>
        

      <div class="canvas-preview__wrapper" v-bind:style="wrapperStyle" @mousewheel="mouseWheel" v-on:dblclick="reset">
        <measure-values v-if="isMeasureMode" :points="points" :scaleFactor="scaleFactor" />
        <canvas ref="previewCanvas"></canvas>
        <canvas ref="drawCanvas"
                v-bind:class="{'_color-picker': mode === 'color-picker'}"
                @mousedown="mouseDown"
                @mouseup="mouseUp"
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
import MeasureValues from './MeasureValues';
import * as Modes from '../constants/modes';

function getSquare(element) {
  const { top, right, bottom, left } = element;
  const width = right - left;
  const height = bottom - top;
  return width * height;
}

function getCurrentSelectedLayers(plainList, mouseBeginPosition, mouseEndPosition) {
  const { x: x1, y: y1 } = mouseBeginPosition;
  const { x: x2, y: y2 } = mouseEndPosition;

  const leftX = Math.min(x1, x2);
  const rightX = Math.max(x1, x2);
  const topY = Math.min(y1, y2);
  const bottomY = Math.max(y1, y2);

  return plainList.filter((element) => {
    const { top, right, bottom, left } = element;

    return left >= leftX && right <= rightX && top >= topY && bottom <= bottomY;
  })
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
  components: { ColorPicker, MeasureValues },
  props: ['imagePath', 'width', 'height'],
  data() {
    return {
      isColorPickerVisible: false,
      colorPickerSize: {
        width: 25,
        height: 25,
      },
      previewCanvasCtx: null,
      drawCanvasCtx: null,
      colorPickerCoords: {
        x: 0,
        y: 0,
      },
      imageData: null,
      points: [],
      scaleFactor: 1,
      scaleFactorStep: 0.02,
      draggableValue: {},
      isMouseDown: false,
      mouseBeginCoords: null,
      mouseEndCoords: null,
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
    isDragMode() {
      return this.mode === Modes.DRAG_MODE;
    },
    wrapperStyle() {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
        transform: `scale(${this.scaleFactor})`
      }
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
        x: (event.clientX - rect.left) / this.scaleFactor,
        y: (event.clientY - rect.top) / this.scaleFactor,
      };
    },
    mouseDown(event) {
      this.isMouseDown = true;
      this.mouseBeginCoords = this.getCoordinates(event);
    },
    mouseUp() {

      if (this.isSelectMode || this.isMeasureMode) {
        if (this.isSelectingMultipleLayers()) {
          const currentSelectedLayers = getCurrentSelectedLayers(this.$store.state.plainList, this.mouseBeginCoords, this.mouseEndCoords);
          this.$store.commit('saveCurrentSelectedLayersId', { ids: currentSelectedLayers.map(layer => layer.id )});

        } else {
          const currentClickedLayer = getCurrentLayer(this.$store.state.plainList, this.getCoordinates(event));
          this.$store.commit('saveCurrentSelectedLayersId', { ids: [ currentClickedLayer.id ] });

          if (currentClickedLayer.type === 'layer') {
            this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
          }
        }

      } else if (this.isColorPickerMode) {
        const { x, y } = this.getCoordinates(event);
        const data = this.previewCanvasCtx.getImageData(x, y, 1, 1).data;
        const hex = `#000000${this.rgbToHex(data[0], data[1], data[2])}`.slice(-6);
        this.copyColor(`#${hex}`);
      }

      this.isMouseDown = false;
      this.mouseBeginCoords = null;
      this.mouseEndCoords = null;
    },
    mouseWheel(event) {
      if (!event.ctrlKey) {
        return;
      } else {
        event.preventDefault();
      }

      if (event.wheelDelta > 0) {
        this.scaleFactor -= this.scaleFactorStep;
      } else {
        this.scaleFactor += this.scaleFactorStep;
      }
    },
    reset() {
      this.scaleFactor = 1;
    },
    mouseMove(event) {
      if (this.isSelectMode || this.isMeasureMode) {
        if (!this.isMouseDown) {
          const currentHoverLayer = getCurrentLayer(this.$store.state.plainList, this.getCoordinates(event));
          this.$store.commit('saveCurrentHoverLayerId', { id: currentHoverLayer.id });

        } else {
          this.mouseEndCoords = this.getCoordinates(event);

          const currentSelectedLayers = getCurrentSelectedLayers(this.$store.state.plainList, this.mouseBeginCoords, this.mouseEndCoords);
          this.$store.commit('saveCurrentSelectedLayersId', { ids: currentSelectedLayers.map(layer => layer.id) });
        }
        
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
      // if (this.isSelectMode || this.isMeasureMode) {
      //   const currentClickedLayer =
      //     getCurrentLayer(this.$store.state.plainList, this.getCoordinates(event));
      //   this.$store.commit('saveCurrentClickedLayerId', { id: currentClickedLayer.id });

      //   if (currentClickedLayer.type === 'layer') {
      //     this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
      //   }
      // } else if (this.isColorPickerMode) {
      //   const { x, y } = this.getCoordinates(event);
      //   const data = this.previewCanvasCtx.getImageData(x, y, 1, 1).data;
      //   const hex = `#000000${this.rgbToHex(data[0], data[1], data[2])}`.slice(-6);
      //   this.copyColor(`#${hex}`);
      // }
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
    isSelectingMultipleLayers() {
      return (this.isMouseDown && this.mouseBeginCoords && this.mouseEndCoords);
    },
    loop() {
      this.drawCanvasCtx.clearRect(0, 0, this.$refs.drawCanvas.width, this.$refs.drawCanvas.height);

      const currentHoverLayer = this.$store.getters.currentHoverLayer;
      const currentSelectedLayers = this.$store.getters.currentSelectedLayers;
      
      if (this.isSelectingMultipleLayers()) {
        this.drawRect(this.mouseBeginCoords, this.mouseEndCoords);

        if (currentSelectedLayers) {
          currentSelectedLayers.forEach(layer => this.draw(layer));
        }

      } else if (this.isSelectMode || this.isMeasureMode) {
        this.draw(currentHoverLayer);

        if (currentSelectedLayers) {
          currentSelectedLayers.forEach(layer => {
            this.draw(layer, this.isMeasureMode);
          })
        }

      } else if (this.isMeasureMode && currentSelectedLayers && currentHoverLayer) {
        const firstCoords = this.getLayerCoordinates(currentHoverLayer);
        const secondCoords = this.getLayerCoordinates(currentClickedLayer);

        this.points = [];
        
        this.points.push(
          ...this.getHorizontalMeasureLinePoints(firstCoords, secondCoords, currentHoverLayer),
        );

        this.points.push(
          ...this.getVerticalMeasureLinePoints(firstCoords, secondCoords, currentHoverLayer),
        );

        this.points.forEach((point) => {
          this.drawLine(point.start, point.end);
        });
      }

      setTimeout(this.loop.bind(this), 50)
    },
    getHorizontalMeasureLinePoints(firstCoords, secondCoords, currentHoverLayer) {
      const closesToLeft =
        this.getClosesSide(
          firstCoords.x1,
          secondCoords.x1,
          secondCoords.x2,
        );

      const closesToRight =
        this.getClosesSide(
          firstCoords.x2,
          secondCoords.x1,
          secondCoords.x2,
        );

      const points = [];
      const y = firstCoords.y2 - (currentHoverLayer.height / 2);

      if (closesToLeft === closesToRight) {
        if (Math.abs(firstCoords.x1 - closesToLeft) < Math.abs(firstCoords.x2 - closesToLeft)) {
          points.push({
            start: { x: firstCoords.x1, y },
            end: { x: closesToLeft, y },
          });

          if (firstCoords.x2 < secondCoords.x2) {
            points.push({
              start: { x: firstCoords.x2, y },
              end: { x: secondCoords.x2, y },
            });
          }
        } else {
          points.push({
            start: { x: firstCoords.x2, y },
            end: { x: closesToRight, y },
          });

          if (firstCoords.x1 > secondCoords.x1) {
            points.push({
              start: { x: firstCoords.x1, y },
              end: { x: secondCoords.x1, y },
            });
          }
        }
      } else {
        points.push({
          start: { x: firstCoords.x1, y },
          end: { x: closesToLeft, y },
        });
        points.push({
          start: { x: firstCoords.x2, y },
          end: { x: closesToRight, y },
        });
      }

      return points;
    },
    getVerticalMeasureLinePoints(firstCoords, secondCoords, currentHoverLayer) {
      const closestToTop =
        this.getClosesSide(
          firstCoords.y1,
          secondCoords.y1,
          secondCoords.y2,
        );

      const closestToBottom =
        this.getClosesSide(
          firstCoords.y2,
          secondCoords.y1,
          secondCoords.y2,
        );

      const points = [];

      const x = firstCoords.x1 + (currentHoverLayer.width / 2);

      if (closestToTop === closestToBottom) {
        if (Math.abs(firstCoords.y1 - closestToTop) < Math.abs(firstCoords.y2 - closestToTop)) {
          points.push({
            start: { x, y: firstCoords.y1 },
            end: { x, y: closestToTop },
          });

          if (firstCoords.y2 < secondCoords.y2) {
            points.push({
              start: { x, y: firstCoords.y2 },
              end: { x, y: secondCoords.y2 },
            });
          }
        } else {
          points.push({
            start: { x, y: firstCoords.y2 },
            end: { x, y: closestToBottom },
          });

          if (firstCoords.y1 > secondCoords.y1) {
            points.push({
              start: { x, y: firstCoords.y1 },
              end: { x, y: secondCoords.y1 },
            });
          }
        }
      } else {
        points.push({
          start: { x, y: firstCoords.y1 },
          end: { x, y: closestToTop },
        });
        points.push({
          start: { x, y: firstCoords.y2 },
          end: { x, y: closestToBottom },
        });
      }

      return points;
    },
    getClosesSide(side, otherFirst, otherSecond) {
      if (Math.abs(side - otherFirst) > Math.abs(side - otherSecond)) {
        return otherSecond;
      }
      return otherFirst;
    },
    getLayerCoordinates(layer) {
      const { left, top, right, bottom } = layer;

      return {
        x1: left,
        y1: top,
        x2: right,
        y2: bottom,
      };
    },
    getLayerSides(layer) {
      const leftSide = {
        start: {
          x: layer.left,
          y: 0,
        },
        end: {
          x: layer.left,
          y: this.$refs.drawCanvas.height,
        },
      };

      const rightSide = {
        start: {
          x: layer.right,
          y: 0,
        },
        end: {
          x: layer.right,
          y: this.$refs.drawCanvas.height,
        },
      };

      const bottomSide = {
        start: {
          x: 0,
          y: layer.bottom,
        },
        end: {
          x: this.$refs.drawCanvas.width,
          y: layer.bottom,
        },
      };

      const topSide = {
        start: {
          x: 0,
          y: layer.top,
        },
        end: {
          x: this.$refs.drawCanvas.width,
          y: layer.top,
        },
      };

      return {
        top: topSide,
        right: rightSide,
        bottom: bottomSide,
        left: leftSide,
      };
    },
    drawRect(from, to) {
      const startX = Math.min(from.x, to.x);
      const startY = Math.min(from.y, to.y);
      const width = Math.abs(from.x - to.x);
      const height = Math.abs(from.y - to.y);
      this.drawCanvasCtx.beginPath();
      this.drawCanvasCtx.rect(startX, startY, width, height);
      this.drawCanvasCtx.strokeStyle = '#41f4cd'; // eslint-disable-line
      this.drawCanvasCtx.lineWidth = 1; // eslint-disable-line
      this.drawCanvasCtx.stroke();
    },
    draw(child, isMeasureMode) {
      if (!child) {
        return;
      }

      const x = child.left + 0.5;
      const y = child.top + 0.5;
      const width = (child.right - x) + 0.5;
      const height = (child.bottom - y) + 0.5;

      this.drawCanvasCtx.beginPath();
      this.drawCanvasCtx.rect(x, y, width, height);
      this.drawCanvasCtx.strokeStyle = isMeasureMode ? '#ff3d3d' : '#41f4cd'; // eslint-disable-line
      this.drawCanvasCtx.lineWidth = 1; // eslint-disable-line
      this.drawCanvasCtx.stroke();

      if (isMeasureMode) {
        const params = {
          lineDash: [5, 7],
        };

        const sides = this.getLayerSides(child);

        this.drawLine(sides.top.start, sides.top.end, params);
        this.drawLine(sides.right.start, sides.right.end, params);
        this.drawLine(sides.bottom.start, sides.bottom.end, params);
        this.drawLine(sides.left.start, sides.left.end, params);
      }
    },
    drawLine(start, end, params = {}) {
      this.drawCanvasCtx.save();
      this.drawCanvasCtx.beginPath();
      this.drawCanvasCtx.moveTo(parseInt(start.x) + 0.5, parseInt(start.y) + 0.5);
      this.drawCanvasCtx.lineTo(parseInt(end.x) + 0.5, parseInt(end.y) + 0.5);
      this.drawCanvasCtx.closePath();
      this.drawCanvasCtx.strokeStyle = params.color || '#ff3d3d';
      this.drawCanvasCtx.lineWidth = 1;
      if (params.lineDash) {
        this.drawCanvasCtx.setLineDash(params.lineDash);
      }
      this.drawCanvasCtx.stroke();
      this.drawCanvasCtx.restore();
    },
  },
};
</script>

<style lang="less" scoped>
  .canvas-preview {
    position: relative;
    
    &__wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
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
