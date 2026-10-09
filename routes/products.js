const express = require('express');
const Joi = require('joi');
const Product = require('../models/product');
const Category = require('../models/category');
const { auth, admin } = require('../middleware/auth');
const { validate, objectId } = require('../middleware/validate');

const router = express.Router();

const productFields = {
    name: Joi.string().trim().min(2).max(200),
    description: Joi.string().max(2000),
    richDescription: Joi.string().allow('').max(20000),
    image: Joi.string().allow('').max(2000),
    images: Joi.array().items(Joi.string().max(2000)),
    brand: Joi.string().allow('').max(100),
    price: Joi.number().min(0),
    category: objectId(),
    countInStock: Joi.number().integer().min(0),
    rating: Joi.number().min(0).max(5),
    numReviews: Joi.number().integer().min(0),
    isFeatured: Joi.boolean()
};

const createSchema = Joi.object(productFields)
    .fork(['name', 'description', 'category', 'countInStock'], (field) => field.required());
const updateSchema = Joi.object(productFields).min(1);

async function categoryExists(req, res, next) {
    if (req.body.category && !(await Category.exists({ _id: req.body.category }))) {
        return res.status(400).send({ error: 'Invalid category' });
    }
    next();
}

//list of products, optional ?category=<id>&featured=true&page=1&limit=20
router.get('/', async (req, res) => {
    const filter = {};
    if (req.query.category) filter.category = { $in: String(req.query.category).split(',') };
    if (req.query.featured === 'true') filter.isFeatured = true;

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('category')
            .sort({ dateCreated: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Product.countDocuments(filter)
    ]);
    res.send({ products, total, page, limit });
});

//product
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).send({ error: 'Product not found' });
    res.send(product);
});

//create new product
router.post('/', auth, admin, validate(createSchema), categoryExists, async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).send(product);
});

//updating a product
router.put('/:id', auth, admin, validate(updateSchema), categoryExists, async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true
    });
    if (!product) return res.status(404).send({ error: 'Product not found' });
    res.send(product);
});

//deleting a product
router.delete('/:id', auth, admin, async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send({ error: 'Product not found' });
    res.send(product);
});

module.exports = router;
