<template>
    <div>
        <li class="hierarchy-item" @click="onClick()">
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
        </li>

        <ul class="hierarchy-item__children" v-if="hasChildren > 0 && isOpened">
            <hierarchy-item :item="child" v-for="child in item.children"></hierarchy-item>
        </ul>
    </div>
</template>

<script>
export default {
  name: 'HierarchyItem',
  props: ['item'],
  data() {
    return {
      isOpened: false,
      hasChildren: this.item.children && this.item.children.length > 0,
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

    &:hover {
      font-weight: bold;
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
        padding-left: 30px;
    }

    &__description {
        display: inline-block;
        padding-left: 30px;
        height: 50px;
        line-height: 50px;
        color: #5c5c5c;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #5c5c5c;
    }
  }

  &__img {
    position: relative;
    top: 7px;
    padding-left: 20px;
    display: inline-block;
    width: 30px;
    height: 30px;
  }
}
</style>
