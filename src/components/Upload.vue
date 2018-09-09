<template>
  <div class="upload">
    <div class="upload__wrapper">
      <div class="upload__dropzone">
        <vue-dropzone
          id="dropzone"
          :options="dropzoneOptions"
          v-show="!loading"
          @vdropzone-file-added="onAdded"
          @vdropzone-upload-progress="onProgress"
          @vdropzone-max-files-exceeded="onExceed"
          @vdropzone-success="onSuccess"
          @vdropzone-error="onError">
        </vue-dropzone>
      </div>
      <div class="upload__loader" v-if="loading">
          <sync-loader color="#19233c"></sync-loader>
        <div class="upload__progress"> 
          {{ progress !== 100 ? `${progress}%` : 'Processing file...'}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import vue2Dropzone from 'vue2-dropzone';
import 'vue2-dropzone/dist/vue2Dropzone.min.css';
import SyncLoader from 'vue-spinner/src/SyncLoader';

const MAX_FILE_SIZE_MB = 100;

export default {
  name: 'Upload',
  data() {
    return {
      dropzoneOptions: {
        url: '/inspector/api/upload',
        acceptedFiles: '.psd',
        maxFilesize: MAX_FILE_SIZE_MB,
        method: 'post',
        paramName: 'psd',
        previewsContainer: false,
      },
      loading: false,
      progress: 0
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
    onProgress(file, progress) {
      this.progress = parseInt(progress);
    }
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
    background-color: transparent;
    border: 2px dashed #19233c;
    color: #19233c;
    box-shadow: 0 1px 10px -2px rgba(0, 0, 0, 0.3);

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .dropzone .dz-message {
    margin: 0;
    font-family: 'Ubuntu', sans-serif;
    font-weight: 500;
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
      flex-direction: column;
    }

    &__progress {
      margin-top: 15px;
    }
  }

</style>

