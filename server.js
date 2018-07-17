const PSD = require('PSD');

const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();
const PORT = 4200;
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(cors());
app.use(fileUpload());
app.use(bodyParser());

app.get('/', (req, res) => res.send('Server started!'));

app.post('/upload', (req, res) => {
    const fileNames = Object.keys(req.files);
    const file = req.files[fileNames[0]];
    const fileName = `${file.name}_${new Date().getTime()}`;
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

app.post('/layer-image', (req, res) => {
  const filePath = `./psd/${req.body.fileName}`;
  const psd = PSD.fromFile(filePath);
  psd.parse();

  const child = psd.tree().childrenAtPath(req.body.layerPath)[0];
  const layerImagePath = `./psd/layer_${new Date().getTime()}.png`;

  child.layer.image.saveAsPng(layerImagePath).then(() => {
    res.send({layerImagePath: layerImagePath}).status(200);
  });
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
