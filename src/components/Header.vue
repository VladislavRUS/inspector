<template>
    <div class="header">
      <div class="header__logo">
        <img src="../assets/html-coding.svg">
      </div>
      <div class="header__title">
        {{imageName}}
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
    }
  }
};
</script>

<style scoped lang="less">
  .header {
    position: fixed;
    background-color: #FFF;
    height: 50px;
    top: 0;
    right: 0;
    left: 0;
    z-index: 100;
    display: flex;
    justify-content: flex-start;

    &__logo {
      padding-left: 20px;
      width: 50px;
      height: 50px;
    }

    &__title {
      padding-left: 20px;
      line-height: 50px;
      font-size: 16px;
      color: #5c5c5c;
      font-weight: bold;
    }
  }
</style>
