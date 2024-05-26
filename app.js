const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const connectDB = require('./config/db')
const dotenv = require('dotenv')
dotenv.config()

const fileRoutes = require('./routes/fileRoutes');
const { cleanUpExpiredFiles } = require('./controllers/fileController');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

// Routes
app.use('/api/files', fileRoutes);

// Route to serve upload.html at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

// Clean up expired files every minute
cron.schedule('* * * * *', cleanUpExpiredFiles);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
