<template>
  <div class="app">
    <Header/>
    <router-view/>
    <portal-target name="color-picker"></portal-target>
  </div>
</template>

<script>
import Header from './components/Header';

export default {
  name: 'App',
  components: { Header },
};
</script>

<style lang="less" scoped>
  .app {
    width: 100%;
    height: 100%;
  }
</style>
