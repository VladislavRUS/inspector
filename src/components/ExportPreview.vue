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
        <fade-loader color="#000"></fade-loader>
    </div>

    <div v-if="!loading && imageData">
      <div class="export-preview__image">
        <img :src="imageSrc" v-bind:style="styleObject"/>
      </div>
      <div class="export-preview__export">
        <a class="export-preview__export-btn" v-bind:href="imageSrc" v-bind:download="name">
          Export ({{layersNumber}})
          <img v-bind:src="exportIcon">
        </a>
      </div>
    </div>

    <div class="export-preview__info-wrapper" v-if="firstLayer">
      <div class="export-preview__info">
        <div class="export-preview__info-item" v-if="singleLayer">
          <div class="export-preview__info-title">Blending mode:</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(`${firstLayer.blendingMode}`)">
              {{firstLayer.blendingMode}}
            </div>
          </div>
        </div>
        <div class="export-preview__info-item">
          <div class="export-preview__info-title">Size:</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(`${width}px`)">
              W: {{width}}px,
            </div>
            <div class="export-preview__info-value"
                 @click="copy(`${height}px`)">
              H: {{`${height}`}}px
            </div>
          </div>
        </div>
        <div class="export-preview__info-item" v-if="singleLayer">
          <div class="export-preview__info-title">Position:</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(`${firstLayer.left}px`)">
              X: {{firstLayer.left}}px,
            </div>
            <div class="export-preview__info-value"
                 @click="copy(`${firstLayer.top}px`)">
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

const EXCLUDED_FONTS = [
  'AdobeInvisFont'
];

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
      return this.$store.getters.currentSelectedLayers
        ? this.$store.getters.currentSelectedLayers.length
        : 0;
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
    name() {
      return this.$store.getters.currentSelectedLayers && (this.$store.getters.currentSelectedLayers.map(layer => layer.name).join('-') + '.png') || '';
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
        const fonts = this.firstLayer.text.font.names.filter(font => EXCLUDED_FONTS.indexOf(font) === -1);
        const uniqueFonts = [...new Set(fonts)].slice(0, 2);

        let fontSize = this.firstLayer.text.font.sizes[0];
        const transY = this.firstLayer.text.transform.yy;
        const lineHeight = parseInt(Math.round((Math.round((fontSize * transY) * 100) * 0.01)));
        fontSize = parseInt(Math.round((Math.round((fontSize * transY) * 100) * 0.01)));

        styles.push({
          key: 'line-height',
          value: `${lineHeight}px`,
        });

        styles.push({
          key: 'font-family',
          value: `${uniqueFonts.join(', ')}`,
        });

        styles.push({
          key: 'font-weight',
          value: `${this.firstLayer.text.font.weights[0]}`,
        });

        

        styles.push({
          key: 'font-size',
          value: `${fontSize}px`,
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
    padding-top: 10px;

    &__loader {
        width: 250px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;

        &-container {
          width: 50px;
          height: 50px;
        }
    }

    &__styles {
      margin: 10px;
      background-color: #eaeaea;
      border: 1px solid #bababa;

      &-title {
        padding-left: 20px;
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: bold;
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
          text-align: right;
          word-break: break-word;
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
        font-size: 14px;
        font-weight: 300;
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
      padding: 0 10px 10px 10px;
      box-sizing: border-box;

      &-value {
        cursor: text;
        margin-bottom: 5px;
        padding: 10px;
        width: 100%;
        min-height: 100px;
        color: black;
        font-size: 16px;
        box-sizing: border-box;
        outline: none;
        background-color: #eaeaea;
        border: 1px solid #bababa;
        resize: none;
      }
    }

    &__image {
      position: relative;
      padding: 10px;
      margin: 0 auto 10px auto;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 230px;
      height: 250px;
      background-image: url('../assets/transparent-bg.png');
      box-sizing: border-box;
      border: 1px solid #bababa;

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
        animation-name: backgroundAnimation;
        animation-duration: 10s;
        animation-timing-function: linear;
        animation-direction: alternate;
        animation-iteration-count: infinite;

        &:after {
          opacity: 1;
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
        background-color: #000;
        outline: none;
        border: 1px solid #606060;
        color: #fff;
        cursor: pointer;
        text-decoration: none;
        font-size: 12px;
        font-weight: 300;
        text-transform: uppercase;
        line-height: 100%;

        & img {
          margin-left: auto;
          padding-left: 10px;
          width: 15px;
          height: 15px;
        }

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.9;
        }
      }
    }
  }

</style>
