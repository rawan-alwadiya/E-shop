const {Category} = require('../models/category');
const {Product} = require('../models/product');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now}.${extension}`);
    }
    });

    const uploadOptions = multer({ storage: storage })

// http://localhost:3000/v1/api/products
router.get('/', async (req, res) => {
    // const productList = await Product.find().select('name image -_id');

    // http://localhost:3000/v1/api/products?categories=234234,555
    let filter = {};
    if(req.query.categories) {
        filter = {category: req.query.categories.split(',')}; // ['234234', '555']
    }
    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false});
    }

    res.send(productList);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false});
    }

    res.send(product);
});

router.post('/', uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, //"http://localhost:3000/public/uploads/image-232323.jpeg"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();

    if(!product) {
        return res.status(500).send('The product cannot be created!');
    }

    res.send(product);
});

router.put('/:id', async (req, res) => {

    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.Category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {new: true}
    );

    if(!product) {
        return res.status(500).send('The product cannot be updated!');
    }

    res.send(product);
});

router.delete('/:id', (req , res) => {
    Product.findByIdAndRemove(req.params.id).then(product => {
        if(product) {
            return res.status(200).json({success: true, message: 'The prodect deleted successfully'});
        } else {
            return res.status(404).json({success: false , message: "The product not found!"})
        }
    }).catch(err => {
        return res.status(500).json({success: false, error: err});
    });
});

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments();

    if(!productCount) {
        return res.status(500).json({success: false});
    }

    res.send({
        productCount: productCount
    });
});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const featuredProducts = await Product.find({isFeatured: true}).limit(+count);

    if(!featuredProducts) {
        return res.status(500).json({success: false});
    }

    res.send(featuredProducts);
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {

    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    
    const files = req.files;
    let imagesPathes = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files) {
        files.map(file => {
            imagesPathes.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPathes
        },
        {new: true}
    );

    if(!product) {
        return res.status(500).send('The product cannot be updated!');
    }

    res.send(product);
});

module.exports = router;