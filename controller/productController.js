const Product = require("../models/product");

// CREATE PRODUCT
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            quantity
        } = req.body;

        if (
            !name ||
            !description ||
            price === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all product data"
            });
        }

        const product = new Product({
            name,
            description,
            price,
            quantity,
             image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await product.save();

        res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
    try {

        const products = await Product.find();

        res.status(200).json({
            message: "Products retrieved successfully",
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// GET PRODUCT BY ID
const getProductById = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct
};