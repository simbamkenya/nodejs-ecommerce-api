const express = require('express');
const Joi = require('joi');
const { categoryRepository, productRepository } = require('../repositories');
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
    res.send(await categoryRepository.findAll());
});

router.get('/:id', async (req, res) => {
    const category = await categoryRepository.findById(req.params.id);
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

//create category
router.post('/', auth, admin, validate(categorySchema), async (req, res) => {
    const category = await categoryRepository.create(req.body);
    res.status(201).send(category);
});

//update
router.put('/:id', auth, admin, validate(categorySchema), async (req, res) => {
    const category = await categoryRepository.update(req.params.id, req.body);
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

//delete
router.delete('/:id', auth, admin, async (req, res) => {
    if (await productRepository.existsInCategory(req.params.id)) {
        return res.status(409).send({ error: 'Category still has products' });
    }

    const category = await categoryRepository.delete(req.params.id);
    if (!category) return res.status(404).send({ error: 'Category with the given id was not found' });
    res.send(category);
});

module.exports = router;
