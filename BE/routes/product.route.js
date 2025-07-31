const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// Show product images
router.get("/", productController.getAllProducts); // Return all products

// Get all products admin
// GET http://localhost:5000/api/products/admin
router.get("/admin", productController.getAllProductsAdmin);

router.get("/filter-paginated", productController.filterAndPaginateProducts);

router.get("/paginated", productController.getProductsPaginated); // Return paginated products
// Search all products  by admin
// GET http://localhost:5000/api/products/admin/search
router.get("/admin/search", productController.searchProductsAdmin);
// Search products
router.get("/search", productController.searchProducts);

// Filter products
router.get("/filter", productController.filterProducts);

//CRUD operations for products
// View product details 
router.get("/:id", productController.getProductById);
// View product details by admin
// GET http://localhost:5000/api/products/admin/:id
router.get("/admin/:id", productController.getProductByIdAdmin);




// Get products by category
// GET http://localhost:5000/api/products/category/:categoryId
router.get("/category/:categoryId", productController.getProductsByCategory);


// Create a new product
router.post('/', productController.createProduct);


// Update an existing product
router.put('/:id', productController.updateProduct);

// Delete a product (soft delete)
// DELETE http://localhost:5000/api/products/:id
router.delete('/:id', productController.softDeleteProduct);

// Restore a deleted product
// POST http://localhost:5000/api/products/:id/restore
router.post('/:id/restore', productController.restoreProduct);


module.exports = router;