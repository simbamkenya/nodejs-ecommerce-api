const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash')


router.get('/', async (req, res)=>{
    const userList = await User.find();
    if(userList) res.status(200).send(userList);
});
router.post('/add', async (req, res)=>{
    const user = new User(_.pick(req.body, ['email', 'name', 'phone', 'passwordHash', 'isAdmin', 'street', 'apartment', 'zip']))
    const salt = await bcrypt.genSalt(10);

    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    // const  user = new User({
    //     name: req.body.name,
    //     email: req.body.email,
    //     phone: req.body.phone,
    //     passwordHash: req.body.passwordHash,
    //     isAdmin: req.body.isAdmin,
    //     street: req.body.street,
    //     apartment: req.body.apartment,
    //     zip: req.body.zip
    // });
    
    const newUser = await user.save();
    if(newUser){
       res.status(200).send(newUser) 
       return;
    } 
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