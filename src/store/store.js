import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import * as Modes from '../constants/modes';

Vue.use(Vuex);

const dfs = (element, visited) => {
  visited.push(element.id);

  if (element.children) {
    element.children.forEach((child) => {
      if (visited.indexOf(child.id) === -1) {
        dfs(child, visited);
      }
    });
  }
};

const getPath = (plainList, path) => {
  const child = path[path.length - 1];
  const parent = plainList.find((element) => {
    if (element.children) {
      return element.children.find(el => el.id === child.id);
    }
  });

  if (parent) {
    path.push(parent);
    return getPath(plainList, path);
  }
};

const getLayerPath = (plainList, layerId) => {
  let path = [plainList.find(layer => layer.id === layerId)];
  getPath(plainList, path);

  path.reverse().shift();
  path = path.map(element => element.name);

  return path.join('/');
};

const fillPlainList = (plainList, element) => {
  plainList.push(element);

  if (element.children) {
    element.children.forEach(child => fillPlainList(plainList, child));
  }
};

const store = new Vuex.Store({
  state: {
    loading: false,
    imagePath: '',
    mode: Modes.SELECT_MODE,
    layerImagePath: '',
    color: null,
    clickedColor: null,
    fileName: '',
    tree: null,
    currentHoverLayerId: null,
    currentClickedLayerId: null,
    plainList: [],
  },
  mutations: {
    saveData(state, { imagePath, tree, fileName }) {
      state.imagePath = imagePath;
      state.tree = tree;
      state.fileName = fileName;

      fillPlainList(state.plainList, state.tree);
    },
    saveCurrentHoverLayerId(state, { id }) {
      state.currentHoverLayerId = id;
    },
    saveCurrentClickedLayerId(state, { id }) {
      state.currentClickedLayerId = id;
    },
    saveLayerImagePath(state, { layerImagePath }) {
      state.layerImagePath = layerImagePath;
    },
    saveLayerAverageColor(state, { color }) {
      state.color = color;
    },
    saveCurrentClickedColor(state, { color }) {
      state.clickedColor = color;
    },
    setMode(state, { mode }) {
      state.mode = mode;
    },
  },
  actions: {
    fetchLayerImage({ state }) {
      state.loading = true;

      axios.post('/api/layer-image', {
        fileName: state.fileName,
        layerPath: getLayerPath(state.plainList, state.currentClickedLayerId),
      }).then((resp) => {
        this.commit('saveLayerImagePath', { layerImagePath: resp.data.layerImagePath });
        this.commit('saveLayerAverageColor', { color: resp.data.color });
      }).catch((err) => {
        console.log(err);
      }).finally(() => {
        state.loading = false;
      });
    },
  },
});

export default store;
