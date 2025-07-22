const express = require('express');
const router = express.Router();
const {getAllOrders, getOrdersByStatus} = require('../controllers/order.controller');
const orderController = require("../controllers/order.controller");

// Get all orders
router.get('/orders', getAllOrders);

// Get orders by status
router.get('/orders/:status', getOrdersByStatus);

// Get orders by user ID
router.get("/user/:userId", orderController.getOrdersByUserId);

// Get orders with filters
router.get("/user/:userId/filter", orderController.getOrdersWithFilters);

// Get order detail by order ID
router.get("/detail/:orderId", orderController.getOrderDetailById);

module.exports = router;