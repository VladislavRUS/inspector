<template>
    <div>
        <li class="hierarchy-item"
            @click="onClick"
            v-bind:style="styleObject"
            :class="{'_selected': isSelected, '_opened': opened}">
            <div class="hierarchy-item__arrow"
                 :class="{'_opened': opened, '_visible': hasChildren}">
                <img src="../assets/angle-right-solid.svg">
            </div>
            <div class="hierarchy-item__img">
                <img src="../assets/folder-solid.svg" v-if="item.type === 'group'">
                <img src="../assets/layer-group-solid.svg" v-if="item.type === 'layer' && !item.text">
                <img src="../assets/font-solid.svg" v-if="item.type === 'layer' && item.text">
            </div>

            <div class="hierarchy-item__description">
                {{item.name}}
            </div>

            <div class="hierarchy-item__visibility"
                  v-if="!item.visible"
                 title="Layer is not visible">
            <img src="../assets/eye-slash-solid.svg">
            </div>
        </li>

        <ul class="hierarchy-item__children" v-if="hasChildren > 0 && opened">
            <hierarchy-item
              v-for="child in item.children"
              :key="child.id"
              :item="child"
              :level="level + 1"></hierarchy-item>
        </ul>
    </div>
</template>

<script>
export default {
  name: 'HierarchyItem',
  props: ['item', 'level'],
  data() {
    return {
      isOpened: false,
      hasChildren: this.item.children && this.item.children.length > 0,
      styleObject: {
        paddingLeft: `${parseInt(this.level, 10) * 10}px`,
      },
    };
  },
  methods: {
    toggleOpened() {
      const nextOpened = !this.opened;

      if (nextOpened === false) {
        this.$store.commit('removeAllAncestors', {id: this.item.id});
      }

      this.isOpened = nextOpened;
    },
    onClick(event) {
      if (this.item.children) {
        this.toggleOpened();
      } else {
        let currentSelectedLayers;

        if (event.ctrlKey) {
          currentSelectedLayers = this.$store.getters.currentSelectedLayers.concat([this.item]);
        } else {
          currentSelectedLayers = [this.item];
        }

        this.$store.commit('saveCurrentSelectedLayersId', { ids: currentSelectedLayers.map(layer => layer.id) });
        this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
      }
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.currentSelectedLayers &&
        this.$store.getters.currentSelectedLayers
          .map(layer => layer.id).indexOf(this.item.id) !== -1;
    },
    opened() {
      const allOpened = this.$store.getters.currentOpenedLayers;
      return this.isOpened || allOpened.indexOf(this.item.id) !== -1;
    }
  },
};
</script>

<style scoped lang="less">

.hierarchy-item {
  display: flex;
  align-items: center;
  height: 35px;
  font-size: 14px;
  user-select: none;
  overflow: hidden;

    &:hover,
    &._selected {
      font-weight: bold;
      opacity: 1;
    }

    &__arrow {
        padding-left: 10px;
        display: inline-block;
        width: 15px;
        height: 15px;
        transition: transform .2s ease;
        opacity: 0;
        flex-shrink: 0;
        flex-grow: 0;

        &._opened {
            transform: rotate(90deg) translate(-10px, -12px);
        }

        &._visible {
          padding-left: 20px;
          opacity: 0.9;
        }
    }

    &__children {
        list-style-type: none;
        padding: 0;
    }

    &__description {
        padding-top: 5px;
        padding-left: 15px;
        padding-bottom: 4px;
        color: #2d2d2d;
        white-space: nowrap;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__visibility {
        margin-left: auto;
        margin-right: 10px;
        width: 15px;
        height: 15px;
    }

    &__img {
        flex-shrink: 0;
        flex-grow: 0;
        padding-left: 7px;
        width: 15px;
        height: 15px;
        opacity: 0.9;
    }
}
</style>
