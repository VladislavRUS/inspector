<template>
  <div class="export-preview">
    <div class="export-preview__text" v-if="showText">
      <textarea
        class="export-preview__text-value"
        v-bind:value="firstLayer.text.value"
        spellcheck="false"
        disabled/>
      <div class="export-preview__export">
        <button class="export-preview__export-btn"
                @click="copy(firstLayer.text.value)">
          Copy text
          <img v-bind:src="copyIcon">
        </button>
      </div>
    </div>

    <div class="export-preview__loader" v-if="loading">
      <fade-loader color="#606060"></fade-loader>
    </div>

    <div v-if="!loading && imageData">
      <div class="export-preview__image">
        <img :src="imageSrc" v-bind:style="styleObject"/>
      </div>
      <div class="export-preview__export">
        <a class="export-preview__export-btn" v-bind:href="imageSrc" download>
          Export ({{layersNumber}})
          <img v-bind:src="exportIcon">
        </a>
      </div>
    </div>

    <div class="export-preview__info-wrapper" v-if="firstLayer">
      <div class="export-preview__info">
        <div class="export-preview__info-item">
          <div class="export-preview__info-title">Size</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(width)">
              W: {{width}}px
            </div>
            <div class="export-preview__info-value"
                 @click="copy(height)">
              H: {{height}}px
            </div>
          </div>
        </div>
        <div class="export-preview__info-item" v-if="singleLayer">
          <div class="export-preview__info-title">Position</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(firstLayer.left)">
              X: {{firstLayer.left}}px
            </div>
            <div class="export-preview__info-value"
                 @click="copy(firstLayer.top)">
              Y: {{firstLayer.top}}px
            </div>
          </div>
        </div>
      </div>

      <div class="export-preview__styles" v-if="singleLayer">
        <div class="export-preview__styles-table">
          <div class="export-preview__styles-row" v-for="style in styles" v-bind:key="style.key">
            <div class="export-preview__styles-td _key">{{style.key}}:</div>
            <div class="export-preview__styles-td _value">
              {{style.value}}

              <div class="export-preview__styles-td-color"
                    v-if="style.key === 'background-color' || style.key === 'color'"
                    v-bind:style="{backgroundColor: style.value}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FadeLoader from 'vue-spinner/src/FadeLoader';
import copyIcon from '../assets/copy-solid.svg';
import exportIcon from '../assets/file-export-solid.svg';
import getBoundingRect from '../helpers/getBoundingRect';

export default {
  name: 'ExportPreview',
  data() {
    return {
      copyIcon,
      exportIcon,
    };
  },
  computed: {
    loading() {
      return this.$store.state.loading;
    },
    isShowImage() {
      return this.item && !this.item.text;
    },
    width() {
      if (this.$store.getters.currentSelectedLayers) {
        const { left, right } = getBoundingRect(this.$store.getters.currentSelectedLayers);

        return right - left;
      }

      return 0;
    },
    layersNumber() {
      return this.$store.getters.currentSelectedLayers ? this.$store.getters.currentSelectedLayers.length : 0
    },
    height() {
      if (this.$store.getters.currentSelectedLayers) {
        const { top, bottom } = getBoundingRect(this.$store.getters.currentSelectedLayers);

        return bottom - top;
      }

      return 0;
    },
    showText() {
      return this.singleLayer &&
        this.firstLayer &&
        this.firstLayer.text &&
        this.firstLayer.text.value;
    },
    imageSrc() {
      return this.$store.state.mergedImageData;
    },
    item() {
      return this.$store.getters.currentSelectedLayers &&
        this.$store.getters.currentSelectedLayers.length > 0;
    },
    singleLayer() {
      return this.$store.getters.currentSelectedLayers &&
        this.$store.getters.currentSelectedLayers.length === 1;
    },
    firstLayer() {
      return this.$store.getters.currentSelectedLayers &&
        this.$store.getters.currentSelectedLayers[0];
    },
    imageData() {
      return this.$store.getters.imageData;
    },
    color() {
      return this.$store.state.clickedColor;
    },
    styles() {
      const styles = [];

      styles.push({
        key: 'width',
        value: `${this.firstLayer.width}px`,
      });

      styles.push({
        key: 'height',
        value: `${this.firstLayer.height}px`,
      });

      if (this.firstLayer.text) {
        styles.push({
          key: 'font-family',
          value: `${this.firstLayer.text.font.name}`,
        });

        styles.push({
          key: 'font-size',
          value: `${parseInt(this.firstLayer.text.font.sizes[0], 10)}px`,
        });

        styles.push({
          key: 'color',
          value: this.$store.getters.color,
        });

        styles.push({
          key: 'text-align',
          value: `${this.firstLayer.text.font.alignment[0]}`,
        });
      } else {
        styles.push({
          key: 'background-color',
          value: this.$store.getters.color,
        });
      }

      return styles;
    },
    styleObject() {
      let width = 'auto';
      let height = 'auto';

      if (this.singleLayer) {
        if (this.firstLayer && this.firstLayer.width < 250) {
          width = `${this.firstLayer.width}px`;
        }

        if (this.firstLayer && this.firstLayer.height < 250) {
          height = `${this.item.height}px`;
        }
      }

      const result = { width, height };
      return result;
    },
  },
  methods: {
    copy(value) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.display = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      this.$toasted.show(`Copied: ${value}`, {
        className: 'toast-custom',
        position: 'bottom-right',
        duration: 2000,
      });
      document.body.removeChild(textarea);
    },
  },
  components: {
    FadeLoader,
  },
};
</script>

<style lang="less" scoped>

  @keyframes backgroundAnimation {
    from {
      background-position-x: 0;
    }

    to {
      background-position-x: 100%;
    }
  }

  .export-preview {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    width: 250px;
    height: 100%;
    overflow-y: auto;

    &__loader {
        width: 250px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &__styles {
      margin: 10px;
      background-color: #F0F0F0;
      border: 1px solid #bababa;

      &-title {
        padding-left: 20px;
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: bold;
        font-family: monospace;
      }

      &-table {
        display: flex;
        flex-direction: column;
      }

      &-row {
        padding: 5px 10px;
        display: flex;

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }

      &-td {
        font-family: monospace;
        font-size: 12px;
        display: flex;
        align-items: center;

        &._key {
          color: #000;
          font-weight: bold;
        }

        &._value {
          color: #6c6c6c;
        }

        &-color {
          margin-left: 5px;
          width: 10px;
          height: 10px;
          border: 1px solid rgba(0, 0, 0, 0.3);
        }

        &:last-child {
          margin-left: auto;
        }
      }
    }

    &__info {
      display: flex;
      flex-direction: column;
      padding: 10px 20px;
      font-family: monospace;

      &-values {
        display: flex;
        margin-left: auto;
      }

      &-item {
        display: flex;

        & + & {
          margin-top: 5px;
        }
      }

      &-title {
        font-weight: bold;
        font-size: 14px;
      }

      &-value {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }

        & + & {
          margin-left: 10px;
        }
      }
    }

    &__text {
      width: 100%;
      height: auto;
      padding: 10px;
      box-sizing: border-box;

      &-value {
        padding: 10px;
        width: 100%;
        min-height: 100px;
        color: black;
        font-size: 14px;
        box-sizing: border-box;
        outline: none;
        background-color: #F0F0F0;
        border: 1px solid #bababa;
        resize: none;
      }
    }

    &__image {
      position: relative;
      background-image: url('../assets/transparent-bg.png');
      width: 100%;
      height: 250px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;

      &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: rgba(162, 162, 162, 0.28);
        z-index:  1;
        opacity: 0;
      }

      &:hover {
        background-color: red;
        animation-name: backgroundAnimation;
        animation-duration: 8s;
        animation-timing-function: linear;
        animation-direction: alternate;
        animation-iteration-count: infinite;

        &:after {
          opacity :1;
        }
      }

      & img {
        position: relative;
        max-width: 100%;
        max-height: 100%;
        z-index: 2;
      }
    }

    &__export {
      display: flex;
      justify-content: center;
      padding: 10px 0;
      width: 100%;
      text-align: center;

      &-btn {
        display: flex;
        align-items: center;
        padding: 7px 20px;
        background-color: #606060;
        outline: none;
        border: 1px solid #606060;
        color: #fff;
        cursor: pointer;
        text-decoration: none;
        font-size: 14px;
        font-weight: 400;
        line-height: 100%;
        box-shadow: 0 1px 5px -2px rgba(0, 0, 0, 0.3);

        & img {
          margin-left: auto;
          padding-left: 10px;
          width: 15px;
          height: 15px;
        }

        &:hover {
          background-color: #4b4b4b;
        }

        &:active {
          background-color: #3a3a3a;
        }
      }
    }
  }

</style>
