const express = require('express');
const router = express.Router();
const Category = require('../models/category')
const Joi = require('joi');

const validateCategory = (category)=>{
    const schema = Joi.object({
        name: Joi.string().min(3).max(10).required(),
        icon: Joi.string().min(3).max(15).required(),
        color: Joi.string().min(3).max(10),
    });
    return schema.validate(category)
}

// all categories
router.get('/all', async (req, res)=>{
    const categoryList = await Category.find();
    if(categoryList) res.status(200).send(categoryList)
})

//create category
router.post('/add', async (req, res)=>{
    //validate
    const result = validateCategory(req.body);
    if(result.error) {
        res.status(400).send(result.error.details[0].message)
         return;
    }

    const newCategory = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    const results = await newCategory.save();
    if(results) res.status(200).send(newCategory)
})

router.get('/:id', async (req, res)=>{
    const category = await Category.findById(req.params.id);
    if(!category){
        res.status(404).send('Category with the given id could not be found...');
        return;
    }
    res.send(category);
})

//update 
router.put('/update/:id', async (req, res)=>{
    //find
    const category = Category.findById(req.params.id);
    if(!category){
        res.status(404).send('Category with the given id was not found')
    }
    //validate
    const result = validateCategory(req.body)
    if(result.error){
        res.status(400).send(result.error.details[0].message)
        return;
    }

    const newCategory = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    const results = await newCategory.save();
    if(results) res.status(200).send(newCategory)
})

//delete not tested
router.delete('/delete/:id', async (req, res)=>{
    const results = await Category.findByIdAndRemove(req.params.id);
    // if(!results) {
    //     res.status(400).send('couse not deleted');
    //     return;
    // }

})




module.exports = router;