<template>
    <div class="hierarchy">
        <ul class="hierarchy__list">
            <hierarchy-item v-for="item in tree.children" :item="item" :key="item.uuid">
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
        background-color: #2E2E2E;
        max-width: 500px;
        min-width: 300px;

        &__list {
            list-style-type: none;
            padding: 0;
        }
    }
</style>
