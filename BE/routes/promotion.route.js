const express = require("express");
const router = express.Router();
const promotionCtrl = require("../controllers/promotion.controller");

router.get("/", promotionCtrl.getAllPromotions);
router.post("/validate", promotionCtrl.validatePromotion);

module.exports = router;
