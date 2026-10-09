const express = require('express');
const Joi = require('joi');
const { orderRepository, productRepository } = require('../repositories');
const { auth, admin } = require('../middleware/auth');
const { validate, objectId } = require('../middleware/validate');

const router = express.Router();

const orderSchema = Joi.object({
    orderItems: Joi.array().min(1).max(100).items(Joi.object({
        product: objectId().required(),
        quantity: Joi.number().integer().min(1).max(1000).required()
    })).unique('product').required(),
    shippingAddress: Joi.object({
        street: Joi.string().trim().max(200).required(),
        apartment: Joi.string().allow('').max(100),
        city: Joi.string().trim().max(100).required(),
        zip: Joi.string().trim().max(20).required(),
        country: Joi.string().trim().max(100).required()
    }).required(),
    phone: Joi.string().trim().min(5).max(30).required()
});

const statusSchema = Joi.object({
    status: Joi.string().valid(...orderRepository.STATUSES).required()
});

//all orders
router.get('/', auth, admin, async (req, res) => {
    res.send(await orderRepository.findAll());
});

//orders of the logged in user
router.get('/mine', auth, async (req, res) => {
    res.send(await orderRepository.findByUser(req.user.userId));
});

router.get('/:id', auth, async (req, res) => {
    const order = await orderRepository.findById(req.params.id);
    if (!order) return res.status(404).send({ error: 'Order not found' });
    if (!req.user.isAdmin && order.user._id.toString() !== req.user.userId) {
        return res.status(404).send({ error: 'Order not found' });
    }
    res.send(order);
});

//place an order: reserves stock and prices items from the database, not the client
router.post('/', auth, validate(orderSchema), async (req, res) => {
    const reserved = [];
    try {
        for (const { product: productId, quantity } of req.body.orderItems) {
            const product = await productRepository.reserveStock(productId, quantity);
            if (!product) {
                await productRepository.releaseStock(reserved);
                const exists = await productRepository.exists(productId);
                return res.status(exists ? 409 : 400).send({
                    error: exists ? `Not enough stock for product ${productId}` : `Invalid product ${productId}`
                });
            }
            reserved.push({ product: product._id, name: product.name, price: product.price, quantity });
        }

        const totalPrice = reserved.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const order = await orderRepository.create({
            user: req.user.userId,
            orderItems: reserved,
            shippingAddress: req.body.shippingAddress,
            phone: req.body.phone,
            totalPrice: Math.round(totalPrice * 100) / 100
        });
        res.status(201).send(order);
    } catch (ex) {
        await productRepository.releaseStock(reserved);
        throw ex;
    }
});

//update order status, cancelling returns the items to stock
router.put('/:id/status', auth, admin, validate(statusSchema), async (req, res) => {
    const order = await orderRepository.findById(req.params.id);
    if (!order) return res.status(404).send({ error: 'Order not found' });
    if (order.status === 'cancelled') return res.status(409).send({ error: 'Order is already cancelled' });

    // only one request may move the order out of its current status
    const updated = await orderRepository.updateStatus(order._id, order.status, req.body.status);
    if (!updated) return res.status(409).send({ error: 'Order was modified concurrently, try again' });

    if (updated.status === 'cancelled') await productRepository.releaseStock(updated.orderItems);
    res.send(updated);
});

module.exports = router;
