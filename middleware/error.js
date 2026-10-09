const mongoose = require('mongoose');

// Express 5 forwards rejected promises from async handlers here
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).send({ error: `Invalid ${err.path}` });
    }
    if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ error: err.message });
    }
    if (err.code === 11000) {
        return res.status(409).send({ error: `${Object.keys(err.keyValue).join(', ')} already exists` });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).send({ error: 'Malformed JSON body' });
    }

    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
}

module.exports = errorHandler;
