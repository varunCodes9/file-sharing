const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    url: String,
    expiration: Date
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
