<template>
    <div class="instruments">
      <ul class="instruments__list">
        <li class="instruments__list-item"
            v-bind:key="item.mode"
            v-for="item in instruments"
            v-bind:title="item.title"
            v-bind:class="{'_selected': isCurrentMode(item.mode)}"
            @click="item.onClick ? item.onClick() : setMode(item.mode)">
          <img v-bind:src="item.icon">
        </li>
      </ul>
    </div>
</template>

<script>

import selectIcon from '../assets/mouse-pointer-solid.svg';
import rulerIcon from '../assets/ruler-solid.svg';
import colorPickerIcon from '../assets/eye-dropper-solid.svg';
import moveIcon from '../assets/arrows-alt-solid.svg';
import redoIcon from '../assets/redo-alt-solid.svg';

import * as Modes from '../constants/modes';

export default {
  name: 'Instruments',
  data() {
    return {
      instruments: [
        {
          title: 'Select',
          icon: selectIcon,
          mode: Modes.SELECT_MODE,
        },
        {
          title: 'Measure',
          icon: rulerIcon,
          mode: Modes.MEASURE_MODE,
        },
        {
          title: 'Color picker',
          icon: colorPickerIcon,
          mode: Modes.COLOR_PICKER_MODE,
        },
        {
          title: 'Move',
          icon: moveIcon,
          mode: Modes.MOVE_MODE,
        },
        {
          title: 'Reset transformations',
          icon: redoIcon,
          onClick: () => this.$store.commit('reset')
        },
      ],
    };
  },
  methods: {
    isCurrentMode(mode) {
      return this.$store.state.mode === mode;
    },
    setMode(mode) {
      this.$store.commit('setMode', { mode });
    },
  },
};
</script>

<style scoped lang="less">
    .instruments {
        background-color: white;
        height: 50px;

        &__list {
          height: 100%;
          padding: 0 20px;
          margin: 0;
          display: flex;
          align-items: center;
          list-style-type: none;

          &-item {
            padding-bottom: 2px;
            width: 23px;
            height: 23px;
            transition: transform .2s ease;
            opacity: 0.6;
            user-select: none;
            cursor: pointer;

            & + & {
              margin-left: 20px;
            }

            &._selected {
              opacity: 0.9;
            }

            &:hover {
              opacity: 1;
            }
          }
        }
    }

</style>
