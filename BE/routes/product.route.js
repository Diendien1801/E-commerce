const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Show product images
router.get('/', productController.getAllProducts);               // Return all products
router.get('/paginated', productController.getProductsPaginated); // Return paginated products

// View product details
router.get('/:id', productController.getProductById);

// Search products
router.get('/search', productController.searchProducts);

// Filter products
router.get('/filter', productController.filterProducts);

module.exports = router;
