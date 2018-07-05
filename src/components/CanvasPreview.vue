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

    this.loop();
  },

  methods: {
    loop() {
      if (this.isMoving) {
        const drawCtx = this.$refs.draw.getContext('2d');
        drawCtx.clearRect(0, 0, this.width, this.height);

        const mousePos = this.$store.state.mousePosition;

        if (mousePos.x && mousePos.y) {
          const child = this.$store.getters.currentChild;

          this.draw(drawCtx, child);

          // this.$store.state.tree.children.forEach((child) => {
          //   this.draw(drawCtx, child);
          // });
          // const child = this.$store.getters.currentChild;
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
      drawCtx.strokeStyle = 'red';
      drawCtx.lineWidth = 3;
      drawCtx.stroke();

      if (child.children) {
        child.children.forEach(c => this.draw(drawCtx, c));
      }
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
  }

</style>
