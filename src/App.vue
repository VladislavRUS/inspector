<template>
  <div class="app">
    <Header v-if="showHeader"/>
    <router-view/>
    <portal-target name="color-picker"></portal-target>
  </div>
</template>

<script>
import Header from './components/Header';

export default {
  name: 'App',
  components: { Header },
  computed: {
    showHeader() {
      return this.$route.name !== 'Home';
    }
  }
};
</script>

<style lang="less" scoped>
  .app {
    width: 100%;
    height: 100%;
    background: #f5f6fa;
  }
</style>
