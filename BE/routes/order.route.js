const express = require('express');
const router = express.Router();
const {getAllOrders, getOrdersByStatus} = require('../controllers/order.controller');

// Get all orders
router.get('/orders', getAllOrders);

// Get orders by status
router.get('/orders/:status', getOrdersByStatus);

module.exports = router;
