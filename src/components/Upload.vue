<template>
  <div class="upload">
    <div class="upload__wrapper">
      <div class="upload__dropzone">
        <vue-dropzone
          id="dropzone"
          :options="dropzoneOptions"
          v-show="!loading"
          @vdropzone-file-added="onAdded"
          @vdropzone-max-files-exceeded="onExceed"
          @vdropzone-success="onSuccess"
          @vdropzone-error="onError">
        </vue-dropzone>
      </div>
      <div class="upload__loader" v-if="loading">
        <sync-loader color="#6c6c6c"></sync-loader>
      </div>
    </div>
  </div>
</template>

<script>

import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import SyncLoader from 'vue-spinner/src/SyncLoader';

const MAX_FILE_SIZE_MB = 200;

export default {
  name: 'Upload',
  data() {
    return {
      dropzoneOptions: {
        url: '/api/upload',
        acceptedFiles: '.psd',
        maxFilesize: MAX_FILE_SIZE_MB,
        method: 'post',
        paramName: 'psd',
        previewsContainer: false
      },
      loading: false,
    };
  },
  methods: {
    onAdded(file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.onExceed();
      } else {
        this.loading = true;
      }
    },
    onSuccess(event) {
      const { imagePath, tree, fileName } = JSON.parse(event.xhr.response);
      this.$store.commit('saveData', { imagePath, tree, fileName });
      this.$router.push('/viewer');
    },
    onError() {
      this.loading = false;

      this.$toasted.error('Error!', {
        duration: 2000,
      });
    },
    onExceed() {
      this.loading = false;

      this.$toasted.error(`Too big file! Should be less than ${MAX_FILE_SIZE_MB}mb`, {
        duration: 2000,
      });
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
    background-color: #FFF;
    border: 2px dashed #A0A0A0;
    color: #A0A0A0;

    &:hover {
      background-color: #DADADA;
    }
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

