const fs = require('fs');
const mime = require('mime');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// GET download file route
router.get('/:id', (req, res, next) => {
    const filePath = path.join('./uploads/', req.params.id); 
    let stat;
    fs.stat(filePath, (err, stats) => {
        stat = stats;
        res.writeHead(200, {
            'Content-Type': `${mime.getType(filePath)}`,
            'Content-Length': stat.size
        });
    
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });

});

// POST upload file route
router.post('/', upload.single('userfile'), (req, res, next) => {
    console.log(req.file.originalname);
    res.send(`File uploaded: ${req.file.originalname}`);
});

module.exports = router;
