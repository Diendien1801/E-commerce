const express = require('express');
const router = express.Router();

const {getAllOrders, getOrdersByStatus} = require('../controllers/order.controller');


const orderController = require('../controllers/order.controller');


// Get all orders
router.get('/orders', orderController.getAllOrders);

// Get orders by status (validate status)
router.get('/orders/status/:status', orderController.getOrdersByStatus);

// Get orders by user ID
router.get("/user/:userId", orderController.getOrdersByUserId);

// Get orders with filters
//router.get("/user/:userId/filter", orderController.getOrdersWithFilters);

// Get orders with filters of a specific user
// GET http://localhost:5000/api/orders/user/:userId?status=pending&page=1&limit=5
router.get("/orders/user/:userId", orderController.getOrdersByUserIdWithFilter);



// Get order detail by order ID
//router.get("/detail/:orderId", orderController.getOrderDetailById);
// Get a single order by its idOrder
router.get('/orders/id/:id', orderController.getOrderById);

// Get paginated orders
router.get('/orders/paginated', orderController.getOrdersPaginated);

// Create new order
router.post('/orders', orderController.createOrder);

// Status transition
router.patch('/orders/:id/approve', orderController.approveOrder);
router.patch('/orders/:id/cancel', orderController.cancelOrder);
router.patch('/orders/:id/ship', orderController.shipOrder);
router.patch('/orders/:id/deliver', orderController.deliverOrder);
router.patch('/orders/:id/return', orderController.returnOrder);
router.patch('/orders/:id/complete', orderController.completeOrder);


module.exports = router;