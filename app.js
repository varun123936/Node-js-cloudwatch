const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// log file path
const logFile = path.join(__dirname, 'app.log');

function writeLog(message) { const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }); const log = `${timestamp} - ${message}\n`; fs.appendFileSync(logFile, log); }

app.get('/', (req, res) => {
    writeLog('Home API hit');
    res.send('Node App Running 🚀');
});

app.get('/error', (req, res) => {
    writeLog('Error endpoint triggered');
    res.status(500).send('Error triggered');
});

app.listen(PORT, () => {
    writeLog(`Server started on port ${PORT}`);
    console.log(`Server running on ${PORT}`);
});