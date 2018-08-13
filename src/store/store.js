/* eslint-disable consistent-return */
import UUID from 'uuid/v1';
import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import * as Modes from '../constants/modes';

Vue.use(Vuex);

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

const setUUID = (element) => {
  Object.defineProperty(element, 'id', {
    value: UUID(),
    writable: false,
  });

  if (element.children) {
    element.children.forEach(child => setUUID(child));
  }
};

const store = new Vuex.Store({
  state: {
    loading: false,
    initialized: false,
    imagePath: '',
    mode: Modes.SELECT_MODE,
    layerImagePath: '',
    color: null,
    clickedColor: null,
    fileName: '',
    tree: null,
    currentHoverLayerId: null,
    currentClickedLayerId: null,
    currentSelectedLayersId: null,
    plainList: [],
  },
  mutations: {
    saveData(state, { imagePath, tree, fileName }) {
      state.imagePath = imagePath;
      state.fileName = fileName;
      state.tree = tree;
      setUUID(state.tree);

      fillPlainList(state.plainList, state.tree);
      state.initialized = true;
    },
    saveCurrentHoverLayerId(state, { id }) {
      state.currentHoverLayerId = id;
    },
    saveCurrentClickedLayerId(state, { id }) {
      state.currentClickedLayerId = id;
    },
    saveCurrentSelectedLayersId(state, { ids }) {
      state.currentSelectedLayersId = ids;
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
  getters: {
    currentHoverLayer: (state) => {
      if (state.currentHoverLayerId) {
        return state.plainList.find(layer => layer.id === state.currentHoverLayerId);
      }
    },
    color: state => (state.color ? state.color : []),
    currentClickedLayer: (state) => {
      if (state.currentClickedLayerId) {
        return state.plainList.find(layer => layer.id === state.currentClickedLayerId);
      }
    },
    currentSelectedLayers: (state) => {
      if (state.currentSelectedLayersId) {
        return state.plainList.filter(layer => layer.type === 'layer' && state.currentSelectedLayersId.find(selectedLayerId => selectedLayerId === layer.id));
      }
    },
  },
  actions: {
    fetchLayerImage({ state, commit }) {
      state.loading = true;

      axios.post('/api/layer-image', {
        fileName: state.fileName,
        layerPath: getLayerPath(state.plainList, state.currentSelectedLayersId[0]),
      }).then((resp) => {
        commit('saveLayerImagePath', { layerImagePath: resp.data.layerImagePath });
        commit('saveLayerAverageColor', { color: resp.data.color });
      }).catch((err) => {
        console.log(err);
      }).finally(() => {
        state.loading = false;
      });
    },
  },
});

export default store;
