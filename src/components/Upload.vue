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
import UUID from 'uuid/v1';

const setUUID = (element) => {
  element.id = UUID();

  if (element.children) {
    element.children.forEach(child => setUUID(child));
  }
};

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
      const { imagePath, tree, fileName } = JSON.parse(event.xhr.response);
      setUUID(tree);

      this.$store.commit('saveData', { imagePath, tree, fileName });
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
    background-color: #2E2E2E;
    color: white;
  }

  .dropzone .dz-message {
    margin: 0;
    font-weight: bold;
  }

  .upload {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
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

