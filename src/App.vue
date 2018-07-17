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
    width: 100%;
    height: 100%;
  }

  body {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #171717;
    font-family: 'Lato', sans-serif;
  }

  img {
    width: 100%;
    height: auto;
  }

  ul {
    padding: 0;
  }
</style>
