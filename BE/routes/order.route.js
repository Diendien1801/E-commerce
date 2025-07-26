const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Get all orders
router.get('/orders', orderController.getAllOrders);

// Get orders by status (validate status)
router.get('/orders/status/:status', orderController.getOrdersByStatus);

// Get a single order by its idOrder
router.get('/orders/id/:idOrder', orderController.getOrderById);

// Get paginated orders
router.get('/orders/paginated', orderController.getOrdersPaginated);

module.exports = router;