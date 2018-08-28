<template>
    <div class="instruments">
      <ul class="instruments__list">
        <li class="instruments__list-item"
            v-bind:key="item.mode"
            v-for="item in instruments"
            v-bind:title="item.title"
            v-bind:class="{'_selected': isCurrentMode(item.mode)}"
            @click="setMode(item.mode)">
          <img v-bind:src="item.icon">
        </li>
      </ul>
    </div>
</template>

<script>

import selectIcon from '../assets/select.png';
import rulerIcon from '../assets/ruler.svg';
import colorPickerIcon from '../assets/color-picker.png';
import moveIcon from '../assets/move.svg';

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
          padding: 0 0 0 20px;
          margin: 0;
          display: flex;
          align-items: center;
          list-style-type: none;

          &-item {
            padding-bottom: 2px;
            width: 30px;
            height: 30px;
            cursor: pointer;
            transition: transform .2s ease;
            opacity: 0.4;
            user-select: none;

            & + & {
              margin-left: 20px;
            }

            &._selected {
              opacity: 1;
            }

            &:hover {
              opacity: 1;
            }
          }
        }
    }

</style>
