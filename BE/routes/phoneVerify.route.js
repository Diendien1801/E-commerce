const express = require("express");
const router = express.Router();
const phoneVerifyController = require("../controllers/phoneVerify.controller");

router.post("/send-otp", phoneVerifyController.sendOTP);
router.post("/verify-otp", phoneVerifyController.verifyOTP);

module.exports = router;
