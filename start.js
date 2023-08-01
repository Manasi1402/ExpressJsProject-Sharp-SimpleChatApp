const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
    res.send(`
        <form action="/login" method="POST">
            <label for="username">Username:</label>
            <input type="text" name="username" id="username">
            <button type="submit">Login</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    if (!username || username.trim() === '') {
        res.status(400).send("Please enter a valid username.");
        return;
    }

    // Store the username in browser's local storage
    res.cookie('username', username);
    res.redirect('/');
});

app.get('/', (req, res) => {
    const username = req.cookies.username;
    if (!username) {
        res.redirect('/login');
        return;
    }

    fs.readFile('chat_messages.txt', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            data = 'No chat messages yet.';
        }

        res.send(`
            <h1>Welcome to the Group Chat</h1>
            <h3>Hello, ${username}</h3>
            ${data}
            <form action="/" method="POST">
                <label for="message">Message:</label>
                <input type="text" name="message" id="message">
                <button type="submit">Send</button>
            </form>
        `);
    });
});

app.post('/', (req, res) => {
    const username = req.cookies.username;
    if (!username) {
        res.status(401).send("Unauthorized. Please log in first.");
        return;
    }

    const message = req.body.message;
    if (!message || message.trim() === '') {
        res.status(400).send("Please enter a valid message.");
        return;
    }

    const chatMessage = `${username}: ${message}\n`;
    fs.appendFile('chat_messages.txt', chatMessage, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("An error occurred while saving the message.");
            return;
        }

        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
