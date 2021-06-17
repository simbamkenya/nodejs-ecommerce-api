const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');
// const salt = require('../services/salt');
const auth = require('../middleware/auth');

const jwt = require('jsonwebtoken');
const config = require('config');


router.get('/', async (req, res)=>{
    const userList = await User.find();
    if(userList) res.status(200).send(userList);
});


//register new user
router.post('/add', auth, async (req, res)=>{
    const user = new User(_.pick(req.body, ['email', 'name', 'phone', 'passwordHash', 'isAdmin', 'street', 'apartment', 'zip']))
    
    const salt = await bcrypt.genSalt(10);

    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);

    const newUser = await user.save();

    const token = user.generateAuthToken();

    if(newUser){
       return res.header('x-header-token', token).send(_.pick(newUser, ['_id', 'name', 'email']));
    } 
})

//user to login
router.post('/login', async (req, res) => {

    const user = await User.findOne({email: req.body.email});
    if(!user){
        res.status(400).send('invalid email or password')
    }
    const validPassword = await bcrypt.compare(req.body.passwordHash, user.passwordHash);

    if(!validPassword) {
        res.status(400).send('invalid password or email');
    }
    
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', "name", "email"]));
})

//list of users 
router.get('/', async (req, res)=>{
    const usersList = await User.find().select('-passwordHash');
    if(!usersList){
        res.status(404).send('users not found..')
    }
    res.send(usersList)
})
//single User
router.get('/:id', async (req, res)=> {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if(!user){
        res.status(404).send('user with the given id not found..')
        return;
    }
    
    res.status(200).send(user)
})
module.exports = router;