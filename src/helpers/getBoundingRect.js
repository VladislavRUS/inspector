const getBoundingRect = (layers) => {
  let left = layers[0].left;
  let right = layers[0].right;
  let top = layers[0].top;
  let bottom = layers[0].bottom;

  layers.forEach((layer) => {
    if (layer.left < left) {
      left = layer.left;
    }

    if (layer.right > right) {
      right = layer.right;
    }

    if (layer.top < top) {
      top = layer.top;
    }

    if (layer.bottom > bottom) {
      bottom = layer.bottom;
    }
  });

  return {
    left, right, bottom, top,
  };
};

export default getBoundingRect;
