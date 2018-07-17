<template>
    <div class="canvas-preview">
      <canvas id="preview-canvas" :width="width" :height="height"></canvas>
      <canvas id="draw-canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>

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
  props: ['imagePath', 'width', 'height'],
  mounted() {
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const drawCanvas = document.getElementById('draw-canvas');
    this.drawCtx = drawCanvas.getContext('2d');

    const image = new Image();

    image.src = `${this.$store.state.apiHost}/${this.imagePath}`;
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
      const currentHoverLayer =
        getCurrentLayer(this.$store.state.plainList, getCoordinates(event));
      this.$store.commit('saveCurrentHoverLayerId', { id: currentHoverLayer.id });
    });

    drawCanvas.addEventListener('mouseleave', () => {
      this.$store.commit('saveCurrentHoverLayerId', { id: null });
    });

    drawCanvas.addEventListener('click', (event) => {
      const currentClickedLayer =
        getCurrentLayer(this.$store.state.plainList, getCoordinates(event));
      this.$store.commit('saveCurrentClickedLayerId', { id: currentClickedLayer.id });

      if (currentClickedLayer.type === 'layer') {
        this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
      }
    });

    this.loop();
  },

  methods: {
    loop() {
      this.drawCtx.clearRect(0, 0, this.width, this.height);

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
    padding: 50px;
    padding-top: 100px;
    display: flex;
    justify-content: center;
  }

  canvas {
    position: absolute;
    box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
  }

</style>
