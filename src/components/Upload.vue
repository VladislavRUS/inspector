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
          <sync-loader color="#2d2d2d"></sync-loader>
        <div class="upload__progress">
          {{ progress !== 100 ? `${progress}%` : 'Processing file...'}}
        </div>
      </div>
      <div class="upload__formats" v-if="!loading">
          <div class="upload__formats-title">
            Supported formats:
          </div>
          <div class="upload__formats-item">
            <img src="../assets/psd.png">
          </div>
      </div>
    </div>
    <div class="upload__try">
      <div class="upload__try-info">
        <div class="upload__try-info-title">
          Try inspecting sample file
        </div>
        <div class="upload__try-info-subtitle">
          Get exported layers, inspect size and measure distances
        </div>
      </div>
      <div class="upload__try-link-wrapper">
        <a href="#" class="upload__try-link">Download</a>
        <div class="upload__try-link-download">
          <img src="../assets/download.svg"/>
        </div>
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
        url: '/inspector/api/upload',
        acceptedFiles: '.psd',
        maxFilesize: MAX_FILE_SIZE_MB,
        method: 'post',
        paramName: 'psd',
        previewsContainer: false,
      },
      loading: false,
      progress: 0,
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
    padding: 200px 0;
    background-color: #fff;
    border: 2px dashed #2d2d2d;
    color: #2d2d2d;
    transition: background-color .2s ease;

    @media screen and (max-width: 960px) {
      padding: 100px 0;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .dropzone .dz-message {
    margin: 0;
    font-family: 'Ubuntu', sans-serif;
    font-weight: 500;
    text-align: center;
    padding: 10px;
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
      padding: 0 20px;
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

    &__formats {
      margin-top: 40px;
      display: flex;
      align-items: center;

      &-title {
        margin-right: 20px;
        font-size: 20px;
        color: #2d2d2d;
      }

      &-item {
        width: 50px;
        height: 50px;

        & img {
          width: 100%;
          height: auto;
        }
      }
    }

    &__try {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      padding: 20px 30px;
      height: 100px;
      background-color: #2d2d2d;
      box-sizing: border-box;

      @media screen and (max-width: 960px) {
        height: 120px;
      }

      @media screen and (max-width: 320px) {
        display: none;
      }

      &-info {
        display: flex;
        flex-direction: column;

        &-title {
          margin-bottom: 10px;
          font-size: 24px;
          color: #fff;
          font-weight: 400;

          @media screen and (max-width: 960px) {
            font-size: 18px;
          }
        }

        &-subtitle {
          font-size: 18px;
          color: #fff;
          font-weight: 300;

          @media screen and (max-width: 960px) {
            font-size: 12px;
          }
        }

      }
      &-link {
        color: #fff;
        font-size: 18px;
        text-decoration: none;
        font-weight: 400;
        margin-right: 20px;

        @media screen and (max-width: 960px) {
          font-size: 18px;
        }

        &:hover {
          text-decoration: underline;
        }

        &-wrapper {
          padding: 0 10px;
          margin-left: auto;
          display: flex;
        }

        &-download {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

</style>

