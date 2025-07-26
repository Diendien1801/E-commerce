const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Get all orders
router.get('/orders', orderController.getAllOrders);

// Get orders by status (validate status)
router.get('/orders/status/:status', orderController.getOrdersByStatus);

module.exports = router;