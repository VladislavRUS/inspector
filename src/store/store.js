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

  return path;
};

const getAllLayers = (parent, plaintList, fillList) => {
  if (parent.type === 'group') {
    parent.children.forEach((child) => {
      if (child.type === 'group') {
        getAllLayers(child, plaintList, fillList);
      } else {
        fillList.push(child);
      }
    });
  }
};

const componentToHex = (c) => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const rgbToHex = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;


const getLayerPath = (plainList, layerId) => {
  let path = [plainList.find(layer => layer.id === layerId)];
  getPath(plainList, path);

  path.reverse().shift();
  path = path.map(element => element.name);

  return path;
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

const saveToCanvas = (layers, commit) => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = layers.map(layer => layer.offsetX + layer.width).sort((w1, w2) => w2 - w1)[0];
  const height = layers.map(layer => layer.offsetY + layer.height).sort((h1, h2) => h2 - h1)[0];

  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

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
        resolve();
      }
    };
  });
});

const copy = obj => JSON.parse(JSON.stringify(obj));

const getAllOpenedLayers = (selectedLayers, plainList, opened) => {
  const prevLength = opened.length;

  selectedLayers.forEach((layerId) => {
    const parent = plainList
      .find(maybeParent =>
        maybeParent.children &&
        maybeParent.children.length &&
        maybeParent.children.find(child => child.id === layerId));

    if (parent && opened.indexOf(parent.id) === -1) {
      opened.push(parent.id);
    }
  });

  const nextLength = opened.length;

  if (nextLength !== prevLength) {
    getAllOpenedLayers(copy(opened), plainList, opened);
  }
};

const getAllAncestors = (id, plainList, ancestors) => {
  ancestors.push(id);
  const item = plainList.find(layer => layer.id === id);

  if (item.children && item.children.length) {
    item.children.forEach(child => getAllAncestors(child.id, plainList, ancestors));
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
    scaleFactor: 1,
    canvasImageData: null,
    mouseOverCanvas: false,
    canvasTranslate: {
      x: 0,
      y: 0,
    },
    canvasPosition: {
      x: 0,
      y: 0,
    },
    currentHoverLayerId: null,
    currentSelectedLayersId: null,
    currentSelectingLayersId: null,
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
    saveScaleFactor(state, { scaleFactor }) {
      state.scaleFactor = scaleFactor;
    },
    saveMouseOverCanvas(state, { overCanvas }) {
      state.mouseOverCanvas = overCanvas;
    },
    saveCanvasTranslate(state, { diffX, diffY }) {
      if (diffX) {
        state.canvasTranslate.x = state.canvasPosition.x + diffX;
      }

      if (diffY) {
        state.canvasTranslate.y = state.canvasPosition.y + diffY;
      }
    },
    saveCanvasPosition(state) {
      state.canvasPosition.x = state.canvasTranslate.x;
      state.canvasPosition.y = state.canvasTranslate.y;
    },
    reset(state) {
      state.scaleFactor = 1;
      state.canvasTranslate = {
        x: 0,
        y: 0,
      };
      state.canvasPosition = {
        x: 0,
        y: 0,
      };
    },
    saveCanvasImageData(state, { imageData }) {
      state.canvasImageData = imageData;
    },
    saveCurrentSelectedLayersId(state, { ids }) {
      const set = new Set();
      ids.forEach(id => set.add(id));
      state.currentSelectedLayersId = [...set];
    },
    saveCurrentSelectingLayersId(state, { ids }) {
      const set = new Set();
      ids.forEach(id => set.add(id));
      state.currentSelectingLayersId = [...set];
    },
    saveLayerImagePaths(state, { layerImagePaths }) {
      state.layerImagePaths = layerImagePaths;
    },
    saveLayerAverageColor(state, { color }) {
      state.color = rgbToHex(color[0], color[1], color[2]);
    },
    saveCurrentClickedColor(state, { color }) {
      state.clickedColor = color;
    },
    setMode(state, { mode }) {
      state.mode = mode;
    },
    saveMergedImageData(state, { data }) {
      state.mergedImageData = data;
    },
    removeAllAncestors(state, { id }) {
      const ancestors = [];
      getAllAncestors(id, state.plainList, ancestors);
      state.currentSelectedLayersId = state.currentSelectedLayersId.filter(id => ancestors.indexOf(id) === -1);
    },
  },
  getters: {
    currentHoverLayer: (state) => {
      if (state.currentHoverLayerId) {
        return state.plainList.find(layer => layer.id === state.currentHoverLayerId);
      }
    },
    color: state => state.color || '',
    currentClickedLayer: (state) => {
      if (state.currentClickedLayerId) {
        return state.plainList.find(layer => layer.id === state.currentClickedLayerId);
      }
    },
    currentSelectedLayers: (state) => {
      const selectedLayers = [];

      if (state.currentSelectedLayersId) {
        state.currentSelectedLayersId.forEach((id) => {
          const searchLayer = state.plainList.find(layer => layer.id === id);

          if (searchLayer.type === 'group') {
            const fillList = [];
            getAllLayers(searchLayer, state.plainList, fillList);
            selectedLayers.push(...fillList);
          } else {
            selectedLayers.push(searchLayer);
          }
        });
      }

      const uniqueLayers = [];
      selectedLayers.forEach((layer) => {
        const exists = !!uniqueLayers.find(uLayer => uLayer.id === layer.id);

        if (!exists) {
          uniqueLayers.push(layer);
        }
      });

      return uniqueLayers;
    },
    currentSelectingLayers: (state) => {
      const selectingLayers = [];

      if (state.currentSelectingLayersId) {
        state.currentSelectingLayersId.forEach((id) => {
          const searchLayer = state.plainList.find(layer => layer.id === id);

          if (searchLayer.type === 'group') {
            const fillList = [];
            getAllLayers(searchLayer, state.plainList, fillList);
            selectingLayers.push(...fillList);
          } else {
            selectingLayers.push(searchLayer);
          }
        });
      }

      return selectingLayers;
    },
    currentOpenedLayers: (state) => {
      const selectedLayers = state.currentSelectedLayersId;
      if (selectedLayers) {
        const opened = [];
        getAllOpenedLayers(selectedLayers, state.plainList, opened);
        return opened;
      }

      return [];
    },
    imageData: state => state.mergedImageData,
  },
  actions: {
    fetchLayerImage({ state, getters, commit }) {
      state.loading = true;


      const layerPaths = getters.currentSelectedLayers
        .map(layer => getLayerPath(state.plainList, layer.id));

      axios.post('/inspector/api/layer-image', {
        fileName: state.fileName,
        layerPaths,
      }).then((resp) => {
        if (!resp.data.layerImagePaths.length) {
          state.loading = false;
          return;
        }

        if (resp.data.layerImagePaths.length === 1) {
          commit('saveLayerAverageColor', { color: resp.data.layerImagePaths[0].color });
        }

        saveToCanvas(resp.data.layerImagePaths, commit).then(() => {
          state.loading = false;
        });
      }).catch((err) => {
        state.loading = false;
      });
    },
  },
});

export default store;
