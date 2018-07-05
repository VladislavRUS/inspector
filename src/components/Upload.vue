<template>
  <div class="upload">
    <div class="upload__wrapper">
      <div class="upload__dropzone">
        <vue-dropzone
          id="dropzone"
          :options="dropzoneOptions"
          v-show="!loading"
          @vdropzone-file-added="loading=true"
          @vdropzone-success="onSuccess">
        </vue-dropzone>
      </div>
      <div class="upload__loader" v-if="loading">
        <sync-loader></sync-loader>
      </div>
    </div>
  </div>
</template>

<script>

import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import SyncLoader from 'vue-spinner/src/SyncLoader';

export default {
  name: 'Upload',
  data() {
    return {
      dropzoneOptions: {
        url: `${this.$store.state.apiHost}/upload`,
        maxFilesize: 40,
        method: 'post',
        previewsContainer: false,
        dictDefaultMessage: 'Drop file here',
      },
      loading: false,
    };
  },
  methods: {
    onSuccess(event) {
      const { imagePath, tree } = JSON.parse(event.xhr.response);
      this.$store.commit('saveData', { imagePath, tree });
      this.$router.push('/viewer');
    },
  },
  components: {
    vueDropzone: vue2Dropzone,
    SyncLoader,
  },
};
</script>

<style lang="less">

  #dropzone {
    height: 100%;
    padding: 200px;
  }

  .dropzone .dz-message {
    margin: 0;
    font-weight: bold;
  }

  .upload {
    height: 100%;
    padding: 50px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    &__dropzone {
      width: 100%;
      max-width: 800px;
    }

    &__loader {
      width: 200px;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

</style>

