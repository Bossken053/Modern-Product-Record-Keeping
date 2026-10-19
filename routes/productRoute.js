const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const authorize = require("../middleware/authorized");
const auth = require('../middleware/auth')
const upload = require('../middleware/uploads');

const { createProduct, getProducts, getProductById, updateProduct} = require("../controller/productController");

// ADMIN: Create product
router.post( "/", auth, authorize("admin"), upload.single("image"), createProduct);

// USER + ADMIN: Get all products
router.get( "/getProduct", auth, getProducts);

// USER + ADMIN: Get product by ID
router.get( "/:id", auth, getProductById);

// ADMIN: Update product
router.put( "/:id", auth, authorize("admin"), updateProduct);

module.exports = router;