const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Create a new payment
router.post('/create', paymentController.createPayment);

// Capture a PayPal payment after approval
router.post('/capturePP', paymentController.capturePayPalPayment);

// Retry a PayPal payment
router.post('/retryPP', paymentController.retryPayPalPayment);

module.exports = router;