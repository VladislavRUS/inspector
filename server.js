const PSD = require('PSD');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();
const PORT = 4200;
const cors = require('cors');
const bodyParser = require('body-parser');
const average = require('image-average-color');

app.use(express.static(__dirname));
app.use(cors());
app.use(fileUpload());
app.use(bodyParser());

app.get('/', (req, res) => res.send('Server started!'));

app.post('/api/upload', (req, res) => {
    const fileNames = Object.keys(req.files);
    const file = req.files[fileNames[0]];
    const fileName = `${new Date().getTime()}_${file.name}`;
    const filePath = `./psd/${fileName}`;

    file.mv(filePath, (err) => {
        if (err) {
          res.send(405);
        }

        const psd = PSD.fromFile(filePath);
        psd.parse();
        
        const tree = psd.tree().export();

        const imagePath = filePath.replace('.psd', '.png');

        psd.image.saveAsPng(imagePath).then(() => {
          res.send({tree, imagePath, fileName}).status(201);
        });
    });
});

const getAvarageColor = (path) => new Promise((resolve, reject) => {
  average(path, (err, color) => resolve(color));
});

app.post('/api/layer-image', async (req, res) => {
  const filePath = `./psd/${req.body.fileName}`;
  const psd = PSD.fromFile(filePath);
  psd.parse();

  const paths = req.body.layerPaths;
  let results = [];

  const { width, height } = psd.tree();

  console.log(width, height);

  for (let i = 0; i < paths.length; i++) {
    try {
      const path = paths[i];
      console.log(path);
      const child = psd.tree().childrenAtPath(path)[0];
      const layerPath = path.join('_').replace(/[^a-zA-Z0-9]/g, '');
      const layerImagePath = `./psd/layer_${layerPath}.png`;
      
      let success;

      if (child.layer) {
        success = await saveLayerImage(child, layerImagePath);

      } else {
        success = false;
      }

      if (success) {
          results.push({ src: layerImagePath.substring(2), x: child.left, y: child.top, width: child.width, height: child.height });

          if (paths.length === 1) {
            results[0].color = await getAvarageColor(layerImagePath);
          }
      }
    } catch(err) {
      console.log(err);
    }
  }

  if (results.length) {
    results = align(results);
  }
  
  res.send({layerImagePaths: results}).status(200);
});

const align = (results) => {
  console.log(results);
  results = results.filter(result => result && ('x' in result) && ('y' in result));

  let minLeft = results[0].x, minTop = results[0].y;

  results.forEach(layer => {
    if (layer.x < minLeft) {
      minLeft = layer.x;
    }

    if (layer.y < minTop) {
      minTop = layer.y;
    }
  });

  results = results.map(layer => ({
    ...layer,
    offsetX: layer.x - minLeft,
    offsetY: layer.y - minTop
  }));

  return results;
};

const saveLayerImage = (child, layerImagePath) => 
  new Promise((resolve, reject) => {
    if (fs.existsSync(layerImagePath)) {
      resolve(true);

    } else {
      try {
        child.layer.image.saveAsPng(layerImagePath).then(() => {
          resolve(true);
        }).catch(err => {
          resolve(false);
        });
      } catch(err){
        console.log(err);
      }
    }
  });

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
