const express = require('express');
const app = express();
// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
// Server
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;
server.listen(port, () => console.log(`Server listening on port ${port}...`));

// Routing
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Mongo
const mongo = require('./utils/mongo');

io.on('connection', socket => {

    socket.on('hello', data => {
        console.dir(data);
        socket.emit('server-sent-data', { username: 'Server', message: `Welcome, ${data.username}` });
        socket.broadcast.emit('server-sent-data', {
            username: 'Server',
            message: `${data.username} has joined channel.`
        });
    });

    socket.on('client-sent-data', data => {
        // socket.broadcast.emit('server-sent-data', { username: data.username, message: data.message });
        io.emit('server-sent-data', { username: data.username, message: data.message });
    });
});

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/html/index.html`);
})

app.post('/register', (req, res) => {
    let data = req.body;

    if (!data || !data.username || !data.password) {
        res.status(500).end('Something wrong...');
        return;
    }

    let user = {
        username: data.username,
        password: data.password
    }
    mongo.addUser(user);
    res.status(200).end('Register successfully!');
});

app.post('/login', async (req, res) => {
    let data = req.body;

    if (!data || !data.username || !data.password) {
        res.status(500).end('Something wrong...');
        return;
    }

    let valid = await mongo.validateLogin(data.username, data.password);
    if (valid) {
        res.status(200).end('Login successfully!');
    } else {
        res.end('Wrong username or password.');
    }
});