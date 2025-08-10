const express = require("express");
const router = express.Router();
const productManagementController = require("../controllers/productManagement.controller");

// Get all products with pagination
// GET localhost:5000/api/prodcutManagement -> lấy tất cả
// GET localhost:5000/api/prodcutManagement?...
router.get("/", productManagementController.getAllProducts);

module.exports = router;
