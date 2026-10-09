const Joi = require('joi');

const objectId = () => Joi.string().hex().length(24);

// returns middleware that validates req.body and replaces it with the cleaned value
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { stripUnknown: true });
        if (error) return res.status(400).send({ error: error.details[0].message });
        req.body = value;
        next();
    };
}

module.exports = { validate, objectId };
