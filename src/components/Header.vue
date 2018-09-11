<template>
    <div class="header">
      <router-link to="/" class="header__title">Inspector</router-link>
    </div>
</template>

<script>
export default {
  name: 'Header',
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
    background-color: #fff;
    border-bottom: 1px solid #e5e6eb;
    height: 50px;
    z-index: 100;

    &__title {
      padding-left: 30px;
      width: 50px;
      height: 50px;
      font-size: 36px;
      letter-spacing: 1.2px;
      font-weight: 400;
      line-height: 50px;
      color: #2d2d2d;
      text-decoration: none;
      cursor: pointer;
    }
  }
</style>
