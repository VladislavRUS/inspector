<template>
    <div class="export-preview">
      <img :src="`${this.$store.state.apiHost}/${this.$store.state.layerImagePath}`"/>
    </div>
</template>

<script>
export default {
  name: 'ExportPreview',
};
</script>

<style lang="less" scoped>
  .export-preview {
    background-color: rgba(255, 255, 255, 0.7);
    padding: 50px;
  }

</style>
