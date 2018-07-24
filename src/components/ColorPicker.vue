<template>
    <canvas id="color-picker" v-bind:style="styleObject" :width="w / 2" :height="h / 2"></canvas>
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
    this.canvas = document.getElementById('color-picker');
    this.context = this.canvas.getContext('2d');

    this.loop();
  },
  methods: {
    loop() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.imageData) {
        this.context.putImageData(this.imageData, 0, 0);
      }

      // this.context.beginPath();
      // this.context.lineWidth = 1;
      // this.context.fillStyle = 'red';
      // this.context.arc(this.canvas.width/2, this.canvas.height/2, 0.8, 0, 2 * Math.PI);
      // this.context.fill();

      requestAnimationFrame(this.loop);
    },
  },
};
</script>

<style scoped>
  #color-picker {
    position: absolute;
    width: 50px;
    height: 50px;
    z-index: 10;
    pointer-events: none;
    border-radius: 50%;
  }
</style>
