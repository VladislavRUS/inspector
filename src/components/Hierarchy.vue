<template>
    <div class="hierarchy">
        <ul class="hierarchy__list">
            <hierarchy-item v-for="item in tree.children" :item="item" :key="item.uuid" :level="0">
            </hierarchy-item>
        </ul>
    </div>
</template>

<script>
import HierarchyItem from './HierarchyItem';

export default {
  name: 'Hierarchy',
  components: {
    HierarchyItem,
  },
  data() {
    return {
      tree: this.$store.state.tree,
    };
  },
};


</script>

<style scoped lang="less">
    .hierarchy {
        background-color: #FFF;
        max-width: 500px;
        min-width: 300px;

        &__list {
            margin: 0;
            padding: 0;
            list-style-type: none;
        }
    }
</style>
