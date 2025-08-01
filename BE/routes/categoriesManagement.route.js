const express = require("express");
const router = express.Router();
const categoriesManagementController = require("../controllers/categoriesManagement.controller");

// CRUD operations
// POST localhost:5000/api/categoriesManagement
router.post("/", categoriesManagementController.createCategory);

// PUT localhost:5000/api/categoriesManagement/:id
router.put("/:id", categoriesManagementController.updateCategory);

// Soft delete and restore operations
// DELETE localhost:5000/api/categoriesManagement/:id
router.delete("/:id", categoriesManagementController.softDeleteCategory);

// Restore category
// PATCH localhost:5000/api/categoriesManagement/:id/restore
router.patch("/:id/restore", categoriesManagementController.restoreCategory);

// Get operations
// GET localhost:5000/api/categoriesManagement/admin/all
router.get(
  "/admin/all",
  categoriesManagementController.getAllCategoriesForAdmin
);
router.get("/:id", categoriesManagementController.getCategoryByIdForAdmin);


module.exports = router;