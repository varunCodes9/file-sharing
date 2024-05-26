const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const File = require('../models/fileModel');
const transporter = require('../config/mailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Function to handle file upload
exports.uploadFile = async (req, res) => {
    const file = req.file;
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const url = crypto.randomBytes(20).toString('hex');

    const newFile = new File({
        filename: file.filename,
        path: file.path,
        url: url,
        expiration: expiration
    });
    await newFile.save();

    res.send({ url: `http://localhost:3000/api/files/download/${url}` });
};

// Function to handle file download
exports.downloadFile = async (req, res) => {
    const file = await File.findOne({ url: req.params.url });

    if (!file || new Date() > file.expiration) {
        return res.status(404).send('File not found or link expired');
    }

    res.download(file.path, file.filename);
};

// Function to send email
exports.sendEmail = async (req, res) => {
    const { email, url } = req.body;

    let info = await transporter.sendMail({
        from: '"File Sharing App" <your-email@gmail.com>',
        to: email,
        subject: 'Your file download link',
        text: `You can download your file using the following link: ${url}`
    });

    res.send('Email sent');
};

// Function to clean up expired files
exports.cleanUpExpiredFiles = async () => {
    const now = new Date();
    const expiredFiles = await File.find({ expiration: { $lt: now } });

    expiredFiles.forEach(async (file) => {
        fs.unlink(file.path, (err) => {
            if (err) throw err;
        });
        await File.deleteOne({ _id: file._id });
    });
};

// Export multer upload configuration
exports.upload = upload;
