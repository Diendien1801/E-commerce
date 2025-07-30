const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// Lấy thông tin giỏ hàng của 1 người dùng
// GET localhost:5000/api/cart/user/:userId
router.get("/user/:userId", cartController.getCartByUserId);

// Thêm sản phẩm vào giỏ hàng (nếu có rồi thì +1)
// POST localhost:5000/api/cart/:userId/add
router.post("/:userId/add", cartController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng (giảm quantity, nếu <1 thì xóa)
// DELETE localhost:5000/api/cart/:userId/remove/:productId
router.delete("/:userId/remove/:productId", cartController.removeFromCart);

module.exports = router;
