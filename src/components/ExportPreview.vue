<template>
    <div class="export-preview">
      <div class="export-preview__color" v-if="color">color</div>
      <div class="export-preview__image" v-if="item && !item.text">
        <img :src="imageSrc" v-bind:style="styleObject" v-if="!loading"/>
      </div>

      <div class="export-preview__text" v-if="item && item.text">
        <div class="export-preview__text-value">
          {{item.text.value}}
        </div>
      </div>

      <div class="export-preview__export" v-if="item">
        <a class="export-preview__export-btn" v-bind:href="imageSrc" download v-if="!item.text">Export (.png)</a>
        <button class="export-preview__export-btn" @click="copy(item.text.value)" v-if="item.text">Copy text</button>
      </div>
      <div class="export-preview__info">
        <div class="export-preview__info-item">
          <div class="export-preview__info-title">Size</div>
          <div class="export-preview__info-values">
              <div class="export-preview__info-value" @click="copy(item.width)">W: {{item.width}}px</div>
              <div class="export-preview__info-value" @click="copy(item.height)">H: {{item.height}}px</div>
          </div>
        </div>
        <div class="export-preview__info-item">
          <div class="export-preview__info-title">Position</div>
          <div class="export-preview__info-values">
            <div class="export-preview__info-value" @click="copy(item.left)">X: {{item.left}}px</div>
            <div class="export-preview__info-value" @click="copy(item.top)">Y: {{item.top}}px</div>
          </div>
        </div>
      </div>

      <div class="export-preview__styles">
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
</template>

<script>

export default {
  name: 'ExportPreview',
  computed: {
    loading() {
      return this.$store.state.loading;
    },
    imageSrc() {
      return `${this.$store.state.layerImagePath}`;
    },
    item() {
      return this.$store.state.plainList.find(layer => layer.id === this.$store.state.currentClickedLayerId);
    },
    color() {
      return this.$store.state.clickedColor;
    },
    styles() {
      const styles = [];

      styles.push({
        key: 'width',
        value: `${this.item.width}px`,
      });

      styles.push({
        key: 'height',
        value: `${this.item.height}px`,
      });

      if (this.item.text) {
        styles.push({
          key: 'font-family',
          value: `${this.item.text.font.name}`,
        });

        styles.push({
          key: 'font-size',
          value: `${parseInt(this.item.text.font.sizes[0])}px`,
        });

        styles.push({
          key: 'color',
          value: `rgba(${this.$store.state.color.join(',')})`,
        });

        styles.push({
          key: 'text-align',
          value: `${this.item.text.font.alignment[0]}`,
        });
      } else {
        styles.push({
          key: 'background-color',
          value: `rgba(${this.$store.state.color.join(',')})`,
        });
      }

      return styles;
    },
    styleObject() {
      let width = '100%';
      let height = 'auto';

      if (this.item && this.item.width < 150) {
        width = `${this.item.width}px`;
      }

      if (this.item && this.item.height < 150) {
        height = `${this.item.height}px`;
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
};
</script>

<style lang="less" scoped>

  .export-preview {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    width: 250px;

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
      height: 250px;

      &-value {
        margin: 10px;
        background-color: white;
        color: black;
        font-size: 24px;
      }
    }

    &__image {
      background-image: url('../assets/transparent-bg.png');
      width: 100%;
      height: 250px;
      display: flex;
      justify-content: center;
      align-items: center;

      & img {
        max-width: 100%;
        max-height: 100%;
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
        box-shadow: 1px 0 10px -2px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        text-decoration: none;

        &:active {
          background-color: rgb(0, 165, 118);
        }
      }
    }
  }

</style>
