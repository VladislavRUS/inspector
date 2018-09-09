<template>
    <div class="header">
      <div class="header__logo" @click="reload">Inspector</div>
      <div class="header__title">{{imageName}}</div>
    </div>
</template>

<script>
export default {
  name: 'Header',
  methods: {
    reload() {
      window.location.reload();
    }
  },
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
    top: 0px;
    right: 0px;
    left: 0px;
    display: flex;
    justify-content: flex-start;
    background: #fff;;
    box-shadow: 0 0 7px -2px rgba(0, 0, 0, 0.4);
    height: 50px;
    z-index: 100;

    &__logo {
      padding-left: 30px;
      width: 50px;
      height: 50px;
      font-size: 24px;
      letter-spacing: 1.2px;
      font-weight: 400;
      line-height: 50px;
      color: #000;
      text-decoration: none;
      cursor: pointer;
    }

    &__title {
      position: absolute;
      right: 20px;
      line-height: 50px;
      font-size: 16px;
      color: #000;
      font-weight: 400;
    }
  }
</style>
