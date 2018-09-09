<template>
    <div class="header">
      <div class="header__logo" @click="reload">Inspector</div>
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

    &__logo {
      padding-left: 30px;
      width: 50px;
      height: 50px;
      font-size: 24px;
      letter-spacing: 1.2px;
      font-weight: 400;
      line-height: 50px;
      color: #19233c;
      text-decoration: none;
      cursor: pointer;
    }
  }
</style>
