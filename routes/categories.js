const express = require('express');
const Joi = require('joi');
const Category = require('../models/category');
const Product = require('../models/product');
const { auth, admin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const categorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    icon: Joi.string().max(100),
    color: Joi.string().max(20)
});

// all categories
router.get('/', async (req, res) => {
    const categoryList = await Category.find();
    res.send(categoryList);
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

//create category
router.post('/', auth, admin, validate(categorySchema), async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).send(category);
});

//update
router.put('/:id', auth, admin, validate(categorySchema), async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after',
        runValidators: true
    });
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

//delete
router.delete('/:id', auth, admin, async (req, res) => {
    const inUse = await Product.exists({ category: req.params.id });
    if (inUse) return res.status(409).send({ error: 'Category still has products' });

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

module.exports = router;
