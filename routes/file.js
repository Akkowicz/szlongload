require('dotenv').config();
const fs = require('fs');
const mime = require('mime');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const execFile = require('child_process').execFile;
const stream = require('stream');
const crypto = require('crypto');
const fileCleaning = require('../controllers/file').job;

const storage = multer.memoryStorage();
const limits = {
    fileSize: 100 * 1024 * 1024,
    files: 1
};
const upload = multer({storage, limits});

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
    const stdinStream = new stream.Readable();
    // Use hashed input as password
    const hash = crypto.createHash('sha256');
    hash.update(req.body.pass);
    const digest = hash.digest('hex');
    
    const seven = execFile('./node_modules/7zip-bin/linux/x64/7za', ['a', `./uploads/${fileName}.7z`, '-mx=0', '-mhe=on', `-si${req.file.originalname}`, `-p${digest}`], (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        stdinStream.unpipe(seven.stdin);
        res.render('index', {
            file: {
                uploaded: true,
                link: `/file/${fileName}`,
                digest: digest
            }
        });
    });

    stdinStream.push(req.file.buffer);
    stdinStream.push(null);
    stdinStream.pipe(seven.stdin);
});

fileCleaning.start();

module.exports = router;
