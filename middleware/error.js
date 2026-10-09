const { AppError } = require('../errors');

// Express 5 forwards rejected promises from async handlers here
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).send({ error: err.message });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).send({ error: 'Malformed JSON body' });
    }

    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
}

module.exports = errorHandler;
