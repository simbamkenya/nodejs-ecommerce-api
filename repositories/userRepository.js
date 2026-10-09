const User = require('../models/user');
const { isValidId, run } = require('./mongo');

const PUBLIC_FIELDS = '-passwordHash';

const userRepository = {
    findAll() {
        return User.find().select(PUBLIC_FIELDS).lean();
    },

    async findById(id) {
        if (!isValidId(id)) return null;
        return User.findById(id).select(PUBLIC_FIELDS).lean();
    },

    // the only lookup that returns passwordHash, for checking credentials
    findByEmailWithPassword(email) {
        return User.findOne({ email: email.toLowerCase() }).lean();
    },

    async create(data) {
        const user = await run(() => User.create(data));
        const { passwordHash, ...rest } = user.toObject();
        return rest;
    },

    setAdminByEmail(email, isAdmin = true) {
        return User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { isAdmin },
            { returnDocument: 'after' }
        ).select(PUBLIC_FIELDS).lean();
    }
};

module.exports = userRepository;
