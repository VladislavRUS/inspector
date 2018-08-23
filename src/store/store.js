/* eslint-disable consistent-return */
import mergeImg from 'merge-img';
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

const saveToCanvas = (layers, commit) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = layers.map(layer => layer.offsetX + layer.width).sort((w1, w2) => w2 - w1)[0];
  const height = layers.map(layer => layer.offsetY + layer.height).sort((h1, h2) => h2 - h1)[0];

  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  console.log(canvas.width, canvas.height);

  let cnt = 0;

  layers.forEach((layer) => {
    const image = new Image();
    image.src = layer.src;

    image.onload = () => {
      ctx.drawImage(image, layer.offsetX, layer.offsetY);
      cnt += 1;

      if (cnt === layers.length) {
        const dataUrl = canvas.toDataURL('image/png');
        commit('saveMergedImageData', { data: dataUrl });
        document.body.removeChild(canvas);
      }
    };
  });
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
    mergedImageData: null,
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
    saveLayerImagePaths(state, { layerImagePaths }) {
      state.layerImagePaths = layerImagePaths;
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
    saveMergedImageData(state, { data }) {
      console.log(data);
      state.mergedImageData = data;
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
    fetchLayerImage({ state, getters, commit }) {
      state.loading = true;

      const layerPaths = getters.currentSelectedLayers.map(layer => getLayerPath(state.plainList, layer.id));
      console.log(getters.currentSelectedLayers);

      axios.post('/api/layer-image', {
        fileName: state.fileName,
        layerPaths,
      }).then((resp) => {
        saveToCanvas(resp.data.layerImagePaths, commit);
        // mergeImg(resp.data.layerImagePaths).then((data) => {
        //   console.log(data);
        //   commit('saveMergedImageData', { data });
        // });
      }).catch((err) => {
        console.log(err);
      }).finally(() => {
        state.loading = false;
      });
    },
  },
});

export default store;
