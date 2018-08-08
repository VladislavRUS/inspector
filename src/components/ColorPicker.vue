<template>
    <div class="color-picker" v-bind:style="styleObject">
      <img class="color-picker__cross" src="../assets/cross.svg"/>
      <canvas ref="colorPickerCanvas" :width="w / 2" :height="h / 2"></canvas>
    </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: ['imageData', 'x', 'y', 'w', 'h'],
  data() {
    return {
      canvas: null,
      context: null,
    };
  },
  computed: {
    styleObject() {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
      };
    },
  },
  mounted() {
    this.canvas = this.$refs.colorPickerCanvas;
    this.context = this.canvas.getContext('2d');

    this.loop();
  },
  methods: {
    loop() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.imageData) {
        this.context.putImageData(this.imageData, 0, 0);
      }

      requestAnimationFrame(this.loop);
    },
  },
};
</script>

<style scoped lang="less">
  .color-picker {
    position: absolute;
    width: 50px;
    height: 50px;
    z-index: 10;
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
