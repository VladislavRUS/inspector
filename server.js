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

app.post('/api/layer-image', (req, res) => {
  const filePath = `./psd/${req.body.fileName}`;
  const psd = PSD.fromFile(filePath);
  psd.parse();

  const child = psd.tree().childrenAtPath(req.body.layerPath)[0];
  console.log(child.layer);
  const layerPath = req.body.layerPath.replace(/[^a-zA-Z0-9]/g, '');
  const layerImagePath = `./psd/layer_${layerPath}.png`;
  const result = layerImagePath.substring(2);

  
  if (fs.existsSync(layerImagePath)) {
    average(layerImagePath, (err, color) => {
      res.send({layerImagePath: result, color}).status(200);
    })
  } else {
    child.layer.image.saveAsPng(layerImagePath).then(() => {
      average(layerImagePath, (err, color) => {
        res.send({layerImagePath: result, color}).status(200);
      })
    });
  }
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
