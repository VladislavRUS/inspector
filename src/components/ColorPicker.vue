<template>
    <div class="color-picker" v-bind:style="styleObject">
      <img class="color-picker__cross" src="../assets/cross.svg"/>
      <canvas ref="colorPickerCanvas" :width="w / 2" :height="h / 2"></canvas>
    </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  data() {
    return {
      w: 20,
      h: 20,
      x: 0,
      y: 0,
      canvas: null,
      context: null,
    };
  },
  computed: {
    styleObject() {
      return {
        left: `${this.x + 10}px`,
        top: `${this.y - 110}px`,
        visibility: this.overCanvas ? 'visible' : 'hidden',
      };
    },
    overCanvas() {
      return this.$store.state.mouseOverCanvas;
    },
  },
  mounted() {
    document.addEventListener('mousemove', this.mouseMoveListener);
    this.canvas = this.$refs.colorPickerCanvas;
    this.context = this.canvas.getContext('2d');

    this.loop();
  },
  methods: {
    mouseMoveListener(event) {
      this.x = event.clientX;
      this.y = event.clientY;
    },
    loop() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.$store.state.canvasImageData) {
        this.context.putImageData(this.$store.state.canvasImageData, 0, 0);
      }

      setTimeout(this.loop.bind(this), 33);
    },
  },
};
</script>

<style scoped lang="less">
  .color-picker {
    position: absolute;
    width: 50px;
    height: 50px;
    z-index: 100;
    border-radius: 50%;
    box-shadow: 0 1px 10px -2px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    pointer-events: none;

    &__cross {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 10px;
      height: 10px;
      pointer-events: none;
    }

    & canvas {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }
</style>
