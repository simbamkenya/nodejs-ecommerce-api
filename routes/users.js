const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user');
const { auth, admin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().min(8).max(72).required(),
    phone: Joi.string().trim().min(5).max(30).required(),
    street: Joi.string().allow('').max(200),
    apartment: Joi.string().allow('').max(100),
    zip: Joi.string().allow('').max(20)
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
});

//register new user
router.post('/register', validate(registerSchema), async (req, res) => {
    const { password, ...fields } = req.body;
    const user = new User({
        ...fields,
        passwordHash: await bcrypt.hash(password, 10)
    });
    await user.save();

    res.status(201).send({ user, token: user.generateAuthToken() });
});

//user to login
router.post('/login', validate(loginSchema), async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    const validPassword = user && await bcrypt.compare(req.body.password, user.passwordHash);
    if (!validPassword) return res.status(400).send({ error: 'Invalid email or password' });

    res.send({ user, token: user.generateAuthToken() });
});

//current user
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send({ error: 'User not found' });
    res.send(user);
});

//list of users
router.get('/', auth, admin, async (req, res) => {
    const usersList = await User.find();
    res.send(usersList);
});

//single user
router.get('/:id', auth, async (req, res) => {
    if (!req.user.isAdmin && req.user.userId !== req.params.id) {
        return res.status(403).send({ error: 'Access denied' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send({ error: 'User with the given id was not found' });
    res.send(user);
});

module.exports = router;
