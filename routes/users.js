const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.get('/', async (req, res)=>{
    const userList = await User.find();
    if(userList) res.status(200).send(userList);
});
router.post('/add', async (req, res)=>{
    const  user = new User({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock
    });
    
    const newUser = await user.save();
    if(newUser) res.status(200).send(newUser);
})

module.exports = router;