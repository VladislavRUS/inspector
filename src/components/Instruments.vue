<template>
    <div class="instruments">
      <ul class="instruments__list">
        <li class="instruments__list-item"
            v-bind:key="item.mode"
            v-for="item in instruments"
            v-bind:title="item.title"
            v-bind:class="{'_selected': isCurrentMode(item.mode)}"
            @click="item.onClick ? item.onClick() : setMode(item.mode)">
          <component :is="item.component" :active="isCurrentMode(item.mode)"/>
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

import MousePointer from './icons/MousePointer';
import Ruler from './icons/Ruler';
import ColorPicker from './icons/ColorPicker';
import Move from './icons/Move';
import Reset from './icons/Reset';

export default {
  name: 'Instruments',
  components: {
    MousePointer,
    Ruler,
    ColorPicker,
    Move,
    Reset
  },
  data() {
    return {
      instruments: [
        {
          title: 'Select',
          component: 'MousePointer',
          mode: Modes.SELECT_MODE,
        },
        {
          title: 'Measure',
          component: 'Ruler',
          mode: Modes.MEASURE_MODE,
        },
        {
          title: 'Color picker',
          component: 'ColorPicker',
          mode: Modes.COLOR_PICKER_MODE,
        },
        {
          title: 'Move',
          component: 'Move',
          mode: Modes.MOVE_MODE,
        },
        {
          title: 'Reset transformations',
          component: 'Reset',
          onClick: () => this.$store.commit('reset'),
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
        background: transparent;
        height: 50px;

        &__list {
          height: 100%;
          padding: 0 20px;
          margin: 0;
          display: flex;
          align-items: center;
          list-style-type: none;

          &-item {
            position: relative;
            padding-bottom: 5px;
            width: 23px;
            height: 23px;
            transition: transform .2s ease;
            opacity: 0.9;
            user-select: none;
            cursor: pointer;

            &:after {
              content: "";
              position: absolute;
              left: 0;
              right: 0;
              bottom: -3px;
              height: 2px;
              background-color: #2d2d2d;
              transform: translateY(10px);
              opacity: 0;
            }

            & + & {
              margin-left: 20px;
            }

            &._selected {
              opacity: 0.9;
            }

            &._selected:after {
              transform: translateY(-3px);
              opacity: 1;
            }

            &:hover {
              opacity: 0.9;
            }
          }
        }
    }

</style>
