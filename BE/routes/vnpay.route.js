const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpay.controller");

// Tạo URL thanh toán
router.post("/create-payment-url", vnpayController.createPaymentUrl);

// Xử lý kết quả trả về từ VNPAY
router.get("/vnpay-return", vnpayController.vnpayReturn);

// IPN (Instant Payment Notification) từ VNPAY
router.get("/vnpay-ipn", vnpayController.vnpayIPN);

// Truy vấn kết quả thanh toán
router.post("/query-transaction", vnpayController.queryTransaction);

// Hoàn tiền
router.post("/refund", vnpayController.refund);

module.exports = router;
