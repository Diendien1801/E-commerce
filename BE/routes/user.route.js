const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
router.post("/", userController.createUser);

router.post("/uploadAvatar", userController.uploadUserAvatar);

// Thêm sản phẩm vào danh sách yêu thích
router.post("/favorite", userController.addFavorite);

// Bỏ sản phẩm khỏi danh sách yêu thích
router.delete("/favorite", userController.removeFavorite);

router.get("/favorite/:userID", userController.getFavoritesByUser);
module.exports = router;
