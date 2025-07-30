const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories.controller");

// GET http://localhost:5000/api/categories/hierarchy - Lấy tất cả categories theo dạng cha-con
router.get("/hierarchy", categoriesController.getAllCategoriesHierarchy);

// GET http://localhost:5000/api/categories/:id - Lấy thông tin category theo ID
router.get("/:id", categoriesController.getCategoryById);
module.exports = router;