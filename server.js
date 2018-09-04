const PSD = require('PSD');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 4200;
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Jimp = require('jimp');

app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser());

app.get('/', (req, res) => res.send('Server started!'));

app.post('/api/upload', upload.single('psd'), (req, res) => {
    const fileName = req.file.filename;
    const psd = PSD.fromFile(req.file.path);
    psd.parse();
    
    const tree = psd.tree().export();

    const imagePath = `./psd/${fileName}.png`;

    psd.image.saveAsPng(imagePath).then(() => {
      res.send({tree, imagePath, fileName}).status(201);
    });
});

const getAverageColor = (path) => new Promise((resolve, reject) => {
  let cnt = 0;
  let RED = 0;
  let GREEN = 0;
  let BLUE = 0;

  Jimp.read(path, (err, image) => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {

      const alpha = image.bitmap.data[idx + 3];

      if (alpha !== 0) {
        const red = image.bitmap.data[idx + 0];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];

        RED += red;
        GREEN += green;
        BLUE += blue;

        cnt++;
      }

      if (x === image.bitmap.width - 1 && y === image.bitmap.height - 1) {
        const average = [ RED / cnt, GREEN / cnt, BLUE / cnt];
        resolve(average);
      }
    });
  });
});

app.post('/api/layer-image', async (req, res) => {
  const filePath = `./uploads/${req.body.fileName}`;
  const psd = PSD.fromFile(filePath);
  psd.parse();

  const paths = req.body.layerPaths;
  let results = [];

  const { width, height } = psd.tree();

  for (let i = 0; i < paths.length; i++) {
    try {
      const path = paths[i];

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
            results[0].color = await getAverageColor(layerImagePath);
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
