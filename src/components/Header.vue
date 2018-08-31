<template>
    <div class="header">
      <div class="header__logo">
        Inspector
      </div>
    </div>
</template>

<script>
export default {
  name: 'Header',
  computed: {
    imageName() {
      let name = '';

      if (this.$store.state.imagePath) {
        const lastSlashIdx = this.$store.state.imagePath.lastIndexOf('/');
        name = this.$store.state.imagePath.substring(lastSlashIdx + 1);
      }

      return name;
    },
  },
};
</script>

<style scoped lang="less">
  .header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: flex-start;
    background-color: #ffffff;
    box-shadow: 0 1px 10px -1px rgba(0, 0, 0, 0.3);
    height: 50px;
    z-index: 100;

    &__logo {
      padding-left: 20px;
      width: 50px;
      height: 50px;
      font-size: 30px;
      font-weight: 400;
      line-height: 50px;
      color: #2D2D2D;
    }

    &__title {
      position: relative;
      left: 70px;
      padding-left: 20px;
      line-height: 50px;
      font-size: 16px;
      color: #5c5c5c;
      font-weight: bold;
    }
  }
</style>
