const express = require("express");
const router = express.Router();
const userManagementController = require("../controllers/userManagement.controller");

// Soft delete user
// DELETE localhost:5000/api/userManagement/:userId/soft-delete
router.delete("/:userId/soft-delete", userManagementController.softDeleteUser);

// Restore user
// PATCH localhost:5000/api/userManagement/:userId/restore
router.patch("/:userId/restore", userManagementController.restoreUser);

// Get user details with orders
// GET localhost:5000/api/userManagement/:userId/details
router.get("/:userId/details", userManagementController.getUserDetails);

// Get all users with pagination
// GET localhost:5000/api/userManagement?page=1&limit=3
router.get("/", userManagementController.getAllUsers);

// Search users by name and userId
// GET localhost:5000/api/userManagement/search?query=searchTerm

router.get("/search", userManagementController.searchUsers);





module.exports = router;
