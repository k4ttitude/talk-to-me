const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'talk-to-me';
const options = { useNewUrlParser: true };

// const client = new MongoClient(url, options);

const connectDatabase = async todo => {
    let _client, db;

    _client = await MongoClient.connect(url, options);
    db = _client.db(dbName);
    try {
        await todo(db);
    } finally {
        _client.close();
    }
}

const addUser = async user => {
    let _client, db;

    _client = await MongoClient.connect(url, options);
    db = _client.db(dbName);
    try {
        await db.collection('user').insertOne(user, (err, r) => {
            if (err)
                console.log(err);
        });
    } finally {
        _client.close();
    }
}

const validateLogin = async (username, password) => {
    let _client, db;

    _client = await MongoClient.connect(url, options);
    db = _client.db(dbName);
    let user = { username: username, password: password };
    try {
        let _result = await db.collection('user').find(user).toArray();
        return _result.length;
    } finally {
        _client.close();
    }
}

module.exports = {
    connectDatabase,
    addUser,
    validateLogin,
}