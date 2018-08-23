<template>
    <div>
        <li class="hierarchy-item" @click="onClick()" v-bind:style="styleObject">
            <div class="hierarchy-item__arrow" :class="{'_opened': isOpened}" v-if="hasChildren">
                <img src="../assets/arrow.svg">
            </div>
            <div class="hierarchy-item__img">
                <img src="../assets/folder.svg" v-if="item.type === 'group'">
                <img src="../assets/layer.svg" v-if="item.type === 'layer'">
            </div>

            <div class="hierarchy-item__description">
                {{item.name}}
            </div>

            <div class="hierarchy-item__visibility" v-if="!item.visible">
                <img src="../assets/not-visible.svg">
            </div>
        </li>

        <ul class="hierarchy-item__children" v-if="hasChildren > 0 && isOpened">
            <hierarchy-item :key="child.id" :item="child" v-for="child in item.children" :level="level + 1"></hierarchy-item>
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
        paddingLeft: `${parseInt(this.level, 10) * 20}px`,
      },
    };
  },
  methods: {
    toggleOpened() {
      this.isOpened = !this.isOpened;
    },
    onClick() {
      this.toggleOpened();

      this.$store.commit('saveCurrentClickedLayerId', { id: this.item.id });

      if (this.item.type === 'layer') {
        this.$store.dispatch('fetchLayerImage', { state: this.$store.state });
      }
    },
  },
};
</script>

<style scoped lang="less">

.hierarchy-item {
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    font-size: 14px;

    &:hover {
      font-weight: bold;
      background-color: #F0F0F0;
    }

    &__arrow {
        padding-left: 20px;
        display: inline-block;
        width: 15px;
        height: 15px;
        transition: transform .2s ease;

        &._opened {
            transform: rotate(90deg) translate(-10px, -10px);
        }
    }

    &__children {
        list-style-type: none;
        padding: 0;
    }

    &__description {
        display: inline-block;
        padding-left: 15px;
        height: 50px;
        line-height: 50px;
        color: #5c5c5c;
    }

    &__visibility {
        position: relative;
        top: 15px;
        right: 10px;
        width: 20px;
        height: 20px;
        display: inline-block;
        float: right;
    }

    &__img {
        position: relative;
        top: 3px;
        padding-left: 15px;
        display: inline-block;
        width: 20px;
        height: 20px;
    }
}
</style>
