const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Tạo payment mới
router.post("/payments", paymentController.createPayment);

// Capture a PayPal payment after approval
router.post('/capturePP', paymentController.capturePayPalPayment);

// Retry a PayPal payment
router.post('/retryPP', paymentController.retryPayPalPayment);
// Lấy payment theo orderId
router.get('/order/:orderId', paymentController.getPaymentByOrderId);
module.exports = router;
