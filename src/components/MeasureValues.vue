<template>
    <div>
        <div class="measure-value"
            v-for="(mValue, index) in measureValues"
            v-if="mValue.value > 0"
            :key="index"
            :style="mValue.style">
            {{mValue.value}} px
        </div>
    </div>
</template>

<script>
export default {
  name: 'MeasureValues',
  props: ['points', 'scaleFactor'],
  computed: {
    measureValues() {
      return this.points.map((point) => {
        const { start, end } = point;
        const fontSize = parseInt(11 / this.scaleFactor, 10);
        const style = {
          fontSize: `${fontSize}px`,
          transform: `translate(${parseInt((start.x + end.x) / 2, 10)}px, ${parseInt((start.y + end.y) / 2, 10)}px)`,
        };

        const value = Math.sqrt(((start.x - end.x) ** 2) + ((start.y - end.y) ** 2));
        return { style, value };
      });
    },
  },
};
</script>

<style scoped lang="less">
    .measure-value {
        position: absolute;
        padding: 2px;
        background-color: #fff;
        color: #2d2d2d;
        text-align: center;
        border-radius: 2px;
        z-index: 100;
        box-shadow: 0 1px 10px -2px rgba(0, 0, 0, 0.55);
        pointer-events: none;
        font-weight: 600;
        -webkit-font-smoothing: antialiased;
    }
</style>
