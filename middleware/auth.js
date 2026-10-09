const jwt = require('jsonwebtoken');
const config = require('../config');

function auth(req, res, next) {
    const header = req.header('authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).send({ error: 'Access denied. No token provided' });
    }

    try {
        req.user = jwt.verify(token, config.jwtPrivateKey);
        next();
    } catch (ex) {
        res.status(401).send({ error: 'Invalid token' });
    }
}

function admin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).send({ error: 'Access denied. Admins only' });
    }
    next();
}

module.exports = { auth, admin };
