const express = require('express');
const { findById } = require('../models/product');
const Product = require('../models/product');
const router = express.Router()
require('dotenv/config')



//list of products
router.get('/', async (req, res)=>{
    const productList = await Product.find();
    res.send(productList);
})

//product
router.get('/:id', async (req, res)=>{
  const product = await Category.findById(req.params.id);
  if(!product) {
      res.status(404).send('Product not found')
  }
})

//create new product
router.post('/', async (req, res)=>{
    const product = new Product({
        name : req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image : req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock : req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured        
    })

    const results = await product.save()
    if(!results){
        res.status(400).send('Product not saved')
    }
    res.json(results)
})

//deleting a product


//updating a product



module.exports = router;