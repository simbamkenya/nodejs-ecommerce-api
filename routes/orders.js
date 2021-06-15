const express = require('express');
const router = express.Router();
const Order = require('../models/order')


router.get('/', async ()=>{
    const orderList = await Order.find();
    if(orderList) res.status(200).send(orderList);
})
router.post('/add',async (req, res)=>{
    const newOrder = new Order({

    });
});

module.exports = router;