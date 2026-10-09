const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.passwordHash;
            return ret;
        }
    }
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { userId: this._id, isAdmin: this.isAdmin },
        config.jwtPrivateKey,
        { expiresIn: config.jwtExpiresIn }
    );
};

const User = mongoose.model('User', userSchema);
module.exports = User;
