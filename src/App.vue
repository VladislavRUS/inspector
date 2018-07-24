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

<style lang="less">

  .toast-custom {
    font-size: 14px !important;
    font-weight: bold !important;
    background-color: #00BC87 !important;
    font-family: 'Lato', sans-serif !important;
    width: 200px !important;
  }

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
    background-color: #F0F0F0;
    font-family: 'Lato', sans-serif;
  }

  img {
    width: 100%;
    height: auto;
  }

  ul {
    padding: 0;
  }

  .color-picker {
    position: absolute;
    width: 30px;
    height: 30px;
    background-color: white;
    z-index: 1000;
    pointer-events: none;
    border-radius: 50%;
    border: 1px dashed black;
  }
</style>
