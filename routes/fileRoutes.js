const express = require('express');
const { uploadFile, downloadFile, sendEmail, upload } = require('../controllers/fileController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:url', downloadFile);
router.post('/send-email', sendEmail);

module.exports = router;
