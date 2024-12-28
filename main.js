const express = require('express');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const client = new Client();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS, JS)

// Event listener for QR code generation (to authenticate WhatsApp Web)
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Event listener when the WhatsApp Web client is ready
client.on('ready', () => {
    console.log('Client is ready!');
});

// API endpoint to handle medicine registration and notification
app.post('/api/medicine', (req, res) => {
    const { name, whatsapp, medicine, expiry } = req.body;
    const expiryMoment = moment(expiry);
    const reminderDate = expiryMoment.subtract(15, 'days').format('YYYY-MM-DD');
    const currentDate = moment().format('YYYY-MM-DD');

    // If the medicine is expiring in 15 days or sooner, send a notification
    if (moment(reminderDate).isSameOrBefore(currentDate)) {
        client.sendMessage(`${whatsapp}@c.us`, `Hi ${name}, your medicine "${medicine}" is expiring in 15 days. Please return or replace it.`);
        res.json({ message: 'Notification sent!' });
    } else {
        res.json({ message: 'The medicine is not due to expire in the next 15 days.' });
    }
});

// Initialize WhatsApp Web client
client.initialize();

// Set up the server to listen on a specified port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
