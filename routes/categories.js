const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
});

router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).send(category);
});



// router.post('/', async (req,res)=>{
//     let category = new Category({
//         name: req.body.name,
//         icon: req.body.icon,
//         color: req.body.color
//     })
//     category = await category.save();

//     if(!category){
//         console.log(err);
//         return res.status(400).send('the category cannot be created!');
//     }

// });

router.post('/', async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        });

        category = await category.save();

        if (category) {
            // If the category is successfully created, send a 200 status code and a success message
            return res.status(200).json({ success: true, message: 'The category is created!', category });
        } else {
            // If the category is not created, return a 404 status code and an error message
            return res.status(404).json({ success: false, message: 'Category not found!' });
        }
    } catch (err) {
        // Log the error to the console
        console.error(err);

        // Send a 500 status code and an error message when an exception occurs
        return res.status(500).json({ success: false, error: err.message });
    }
});


router.put('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        { new: true}
    );

    if(!category)
    return res.status(400).send('the category cannot be created!')

    res.send(category);
})

router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
        console.log(err);
        return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;