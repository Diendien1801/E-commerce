const express = require("express");
const router = express.Router();
const productManagementController = require("../controllers/productManagement.controller");

// Get all products with pagination
router.get("/", productManagementController.getAllProductsAdmin);

module.exports = router;