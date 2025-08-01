const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.createUser);

router.get('/:id', userController.getUserById);
router.post("/uploadAvatar", userController.uploadUserAvatar);

// Thêm sản phẩm vào danh sách yêu thích
router.post("/favorite", userController.addFavorite);

// Bỏ sản phẩm khỏi danh sách yêu thích
router.delete("/favorite", userController.removeFavorite);

router.get("/favorite/:userID", userController.getFavoritesByUser);

// Route: change avatar
router.put("/changeavt", userController.changeAvatar);

// Route: change password
router.put("/changepass", userController.changePassword);

// Route: update user information
router.put("/update", userController.updateUser);

module.exports = router;
