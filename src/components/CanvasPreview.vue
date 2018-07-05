<template>
    <div class="canvas-preview">
      <canvas ref="preview" :width="width" :height="height"></canvas>
      <canvas ref="draw" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
export default {
  name: 'CanvasPreview',
  props: ['imagePath', 'width', 'height'],
  data() {
    return {
      moveTimeout: null,
      isMoving: false,
    };
  },
  mounted() {
    const previewCanvas = this.$refs.preview;
    const drawCanvas = this.$refs.draw;

    const previewCtx = previewCanvas.getContext('2d');
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
      if (this.moveTimeout) clearTimeout(this.moveTimeout);
      this.isMoving = true;
      this.$store.commit('saveMousePosition', getCoordinates(event));

      this.moveTimeout = setTimeout(() => { this.isMoving = false; }, 200);
    });

    drawCanvas.addEventListener('click', (event) => {
      this.$store.commit('saveClickPosition', getCoordinates(event));
    });

    this.loop();
  },

  methods: {
    loop() {
      if (this.isMoving) {
        const drawCtx = this.$refs.draw.getContext('2d');
        drawCtx.clearRect(0, 0, this.width, this.height);

        const overLayer = this.$store.getters.overLayer;

        if (overLayer) {
          this.draw(drawCtx, overLayer);
        }

        const currentLayer = this.$store.getters.currentLayer;

        if (currentLayer) {
          this.draw(drawCtx, currentLayer);

          drawCtx.beginPath();
          drawCtx.moveTo(overLayer.left, overLayer.top);
          drawCtx.lineTo(currentLayer.left, currentLayer.top);
          drawCtx.closePath();
          drawCtx.strokeStyle = 'red';
          drawCtx.lineWidth = 1;
          drawCtx.stroke();
        }
      }

      requestAnimationFrame(this.loop);
    },
    draw(drawCtx, child) {
      const x = child.left;
      const y = child.top;
      const width = child.right - x;
      const height = child.bottom - y;

      drawCtx.beginPath();
      drawCtx.rect(x, y, width, height);
      drawCtx.strokeStyle = '#41f4cd'; // eslint-disable-line
      drawCtx.lineWidth = 2; // eslint-disable-line
      drawCtx.stroke();
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
