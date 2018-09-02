<template>
    <div>
        <li class="hierarchy-item"
            @click="onClick"
            v-bind:style="styleObject"
            :class="{'_selected': isSelected}">
            <div class="hierarchy-item__arrow"
                 :class="{'_opened': isOpened, '_visible': hasChildren}">
                <img src="../assets/angle-right-solid.svg">
            </div>
            <div class="hierarchy-item__img">
                <img src="../assets/folder-solid.svg" v-if="item.type === 'group'">
                <img src="../assets/layer-group-solid.svg" v-if="item.type === 'layer'">
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

        <ul class="hierarchy-item__children" v-if="hasChildren > 0 && isOpened">
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
      this.isOpened = !this.isOpened;
    },
    onClick(event) {
      if (this.item.children) {
        this.toggleOpened();

      } else {
        let currentSelectedLayers

        if (event.ctrlKey) {
          currentSelectedLayers = this.$store.getters.currentSelectedLayers.concat([this.item]);
          
        } else {
          currentSelectedLayers = [ this.item ];
        }

        this.$store.commit('saveCurrentSelectedLayersId', { ids: currentSelectedLayers.map(layer => layer.id) });
        this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
      }
    },
  },
  computed: {
    isSelected() {
      return this.$store.getters.currentSelectedLayers && 
        this.$store.getters.currentSelectedLayers.map(layer => layer.id).indexOf(this.item.id) !== -1;
    },
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
      background-color: #F0F0F0;
    }

    &__arrow {
        padding-left: 10px;
        display: inline-block;
        width: 20px;
        height: 20px;
        transition: transform .2s ease;
        opacity: 0;
        flex-shrink: 0;
        flex-grow: 0;

        &._opened {
            transform: rotate(90deg) translate(-10px, -12px);
        }

        &._visible {
          padding-left: 20px;
          opacity: 0.6;
        }
    }

    &__children {
        list-style-type: none;
        padding: 0;
    }

    &__description {
        padding-top: 5px;
        padding-left: 15px;
        color: #606060;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__visibility {
        margin-left: auto;
        margin-right: 10px;
        width: 20px;
        height: 20px;
        opacity: 0.6;
    }

    &__img {
        flex-shrink: 0;
        flex-grow: 0;
        padding-left: 15px;
        width: 20px;
        height: 20px;
        opacity: 0.6;
    }
}
</style>
