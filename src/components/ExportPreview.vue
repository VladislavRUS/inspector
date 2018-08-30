<template>
  <div class="export-preview" v-if="imageData">
    <div class="export-preview__loader" v-if="loading">
      <fade-loader></fade-loader>
    </div>

    <div class="export-preview__text" v-if="showText">
      <div class="export-preview__text-value">
        {{firstLayer.text.value}}
      </div>

      <div class="export-preview__export">
        <button class="export-preview__export-btn"
                @click="copy(firstLayer.text.value)">
          Copy text
        </button>
      </div>

    </div>

    <div class="export-preview__image" v-if="!loading">
      <img :src="imageSrc" v-bind:style="styleObject"/>
    </div>

    <div class="export-preview__export">
      <a class="export-preview__export-btn" v-bind:href="imageSrc" download>
        Export
      </a>
    </div>
    <div class="export-preview__info-wrapper" >
      <div class="export-preview__info">
        <div class="export-preview__info-item">
          <div class="export-preview__info-title">Size</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value"
                 @click="copy(firstLayer.width)">
              W: {{firstLayer.width}}px
            </div>
            <div class="export-preview__info-value"
                 @click="copy(firstLayer.height)">
              H: {{firstLayer.height}}px
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
        <div class="export-preview__styles-title">
          Styles
        </div>
        <div class="export-preview__styles-table">
          <div class="export-preview__styles-row" v-for="style in styles" v-bind:key="style.key">
            <div class="export-preview__styles-td _key">{{style.key}}</div>
            <div class="export-preview__styles-td _value">{{style.value}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FadeLoader from 'vue-spinner/src/FadeLoader';

export default {
  name: 'ExportPreview',
  computed: {
    loading() {
      return this.$store.state.loading;
    },
    isShowImage() {
      return this.item && !this.item.text;
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

    &__loader {
        width: 250px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &__styles {
      &-title {
        padding-left: 20px;
        margin-bottom: 5px;
        font-size: 16px;
        font-weight: bold;
      }

      &-table {
        display: flex;
        flex-direction: column;
      }

      &-row {
        padding: 5px 20px;
        display: flex;

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }

      &-td {
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;

        &._key {
          color: #00b0dc;
        }

        &._value {
          color: #c26bfa;
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
          margin-top: 10px;
        }
      }

      &-title {
        font-weight: bold;
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

      &-value {
        margin: 10px;
        background-color: white;
        color: black;
        font-size: 24px;
      }
    }

    &__image {
      position: relative;
      background-image: url('../assets/transparent-bg.png');
      width: 100%;
      height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;

      &:after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: rgba(115, 255, 198, 0.3);
        z-index:  1;
        opacity: 0;
      }

      &:hover {
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
      padding: 10px 0;
      width: 100%;
      text-align: center;

      &-btn {
        display: inline-block;
        padding: 10px 20px;
        background-color: #00BC87;
        outline: none;
        border: none;
        color: #fff;
        font-weight: bold;
        border-radius: 2px;
        cursor: pointer;
        text-decoration: none;

        &:active {
          background-color: rgb(0, 165, 118);
        }
      }
    }
  }

</style>
