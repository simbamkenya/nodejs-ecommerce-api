const mongoose = require('mongoose');
const { ValidationError, ConflictError } = require('../errors');

const isValidId = (id) => mongoose.isValidObjectId(id);

// run a mongoose operation, rethrowing driver errors as app errors
async function run(operation) {
    try {
        return await operation();
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
            throw new ValidationError(err.message);
        }
        if (err.code === 11000) {
            throw new ConflictError(`${Object.keys(err.keyValue).join(', ')} already exists`);
        }
        throw err;
    }
}

const updateOptions = { returnDocument: 'after', runValidators: true };

module.exports = { isValidId, run, updateOptions };
