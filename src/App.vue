<template>
  <div class="app">
    <Header/>
    <router-view/>
  </div>
</template>

<script>
import Header from './components/Header';

export default {
  name: 'App',
  components: { Header },
};
</script>

<style lang="less">

  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  body {
    height: 100vh;
    background-color: #F0F0F0;
    font-family: 'Lato', sans-serif;
  }
</style>
