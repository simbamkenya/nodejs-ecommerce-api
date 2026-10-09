const Order = require('../models/order');
const { isValidId, run } = require('./mongo');

const orderRepository = {
    STATUSES: Order.STATUSES,

    findAll() {
        return Order.find()
            .populate('user', 'name email')
            .sort({ dateOrdered: -1 })
            .lean();
    },

    findByUser(userId) {
        return Order.find({ user: userId }).sort({ dateOrdered: -1 }).lean();
    },

    async findById(id) {
        if (!isValidId(id)) return null;
        return Order.findById(id).populate('user', 'name email').lean();
    },

    async create(data) {
        const order = await run(() => Order.create(data));
        return order.toObject();
    },

    // moves the order to `to` only if it is still in `from`, so concurrent updates can't both win
    async updateStatus(id, from, to) {
        if (!isValidId(id)) return null;
        return Order.findOneAndUpdate(
            { _id: id, status: from },
            { status: to },
            { returnDocument: 'after' }
        ).lean();
    }
};

module.exports = orderRepository;
