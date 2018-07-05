// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'normalize.css';
import Vuex from 'vuex';
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(Vuex);

function getPlainChildrenList(plainList, element) {
  if (element.children) {
    plainList.push(...element.children);

    element.children.forEach(child => getPlainChildrenList(plainList, child));
  }
}

function getSquare(element) {
  const { top, right, bottom, left } = element;
  const width = right - left;
  const height = bottom - top;
  return width * height;
}

function getCurrentChild(plainList, mousePosition) {
  const { x, y } = mousePosition;

  const overChildren = plainList.filter((element) => {
    const { top, right, bottom, left } = element;

    return x >= left && x <= right && y >= top && y <= bottom;
  }).sort((first, second) => getSquare(first) - getSquare(second));

  return overChildren[0];
}

const store = new Vuex.Store({
  state: {
    imagePath: '',
    tree: null,
    plainList: [],
    apiHost: 'http://localhost:4200',
    mousePosition: {
      x: null,
      y: null,
    },
  },
  mutations: {
    saveData(state, { imagePath, tree }) {
      state.imagePath = imagePath;
      state.tree = tree;
      getPlainChildrenList(state.plainList, tree);
    },
    saveMousePosition(state, position) {
      state.mousePosition = position;
    },
  },
  getters: {
    currentChild: (state) => {
      const child = getCurrentChild(state.plainList, state.mousePosition);

      return child;
    },
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App,
  },
  template: '<App/>',
});
