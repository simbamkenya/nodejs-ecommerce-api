const mongoose = require('mongoose');
const config = require('./config');

async function connect() {
    await mongoose.connect(config.mongodbUri);
    console.log('mongodb is connected');
}

async function disconnect() {
    await mongoose.disconnect();
}

module.exports = { connect, disconnect };
