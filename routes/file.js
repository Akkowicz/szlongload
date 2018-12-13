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
    res.send(`Respond with a file: ${req.params.id}`);
});

// POST upload file route
router.post('/', upload.single('userfile'), (req, res, next) => {
    console.log(req.file.originalname);
    res.send(`File uploaded: ${req.file.originalname}`);
});

module.exports = router;
