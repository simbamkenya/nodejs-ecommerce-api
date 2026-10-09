const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    // price at the time the order was placed
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: {
        type: [orderItemSchema],
        validate: (items) => items.length > 0
    },
    shippingAddress: {
        street: { type: String, required: true },
        apartment: { type: String, default: '' },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true }
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ORDER_STATUSES,
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
Order.STATUSES = ORDER_STATUSES;
module.exports = Order;
