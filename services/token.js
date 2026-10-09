const jwt = require('jsonwebtoken');
const config = require('../config');

function generateAuthToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), isAdmin: user.isAdmin },
        config.jwtPrivateKey,
        { expiresIn: config.jwtExpiresIn }
    );
}

module.exports = { generateAuthToken };
