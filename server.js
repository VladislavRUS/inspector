const PSD = require('PSD');

const fileUpload = require('express-fileupload');
const express = require('express');
const app = express();
const PORT = 4200;
const cors = require('cors');

app.use(express.static(__dirname));
app.use(cors());
app.use(fileUpload());

app.get('/', (req, res) => res.send('Server started!'));

app.post('/upload', (req, resp) => {
    const fileNames = Object.keys(req.files);
    const file = req.files[fileNames[0]];
    const filePath = `./psd/${file.name}`;

    file.mv(filePath, (err) => {
        if (err) {
            resp.send(405);
        }

        const psd = PSD.fromFile(filePath);
        psd.parse();

        const tree = psd.tree().export();

        const imagePath = filePath.replace('.psd', '.png');

        psd.image.saveAsPng(imagePath).then(() => {
            resp.send({tree, imagePath}).status(200);
        });
    });
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
