require('dotenv').config();
const fs = require('fs');
const mime = require('mime');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const execFile = require('child_process').execFile;
const stream = require('stream');

const storage = multer.memoryStorage();

const upload = multer({ storage });

// GET download file route
router.get('/:id', (req, res, next) => {
    const fileName = `${req.params.id}.7z`;
    const filePath = `./uploads/${fileName}`; 
    const dispoString = `inline; filename="${fileName}"`;
    let stat;
    fs.stat(filePath, (err, stats) => {
        stat = stats;
        res.writeHead(200, {
            'Content-Type': `${mime.getType(filePath)}`,
            'Content-Length': stat.size,
            'Content-Disposition': dispoString
        });
    
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });

});

// POST upload file route
router.post('/', upload.single('userfile'), (req, res, next) => {
    const fileName = Date.now();
    const seven = execFile('7za', ['a', `./uploads/${fileName}.7z`, `-mhe=on`, `-si${req.file.originalname}`, `-p${req.body.pass}`], (error, stdout, stderr) => {
        if (error) {
          throw error;
        }
    });
    const stdinStream = new stream.Readable();
    stdinStream.push(req.file.buffer);
    stdinStream.push(null);
    stdinStream.pipe(seven.stdin);
    res.render('index', {
        file: {
            uploaded: true,
            link: `/file/${fileName}`
        }
    });
});

module.exports = router;
