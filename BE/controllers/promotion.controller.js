const Promotion = require("../models/promotion.model");

exports.getAllPromotions = async (req, res) => {
  const promotions = await Promotion.find({ isActive: true });
  res.json({ success: true, data: promotions });
};

exports.validatePromotion = async (req, res) => {
  const { code, orderValue } = req.body;
  const promo = await Promotion.findOne({ code, isActive: true });
  if (!promo)
    return res
      .status(400)
      .json({ success: false, message: "Mã không hợp lệ hoặc đã hết hạn" });

  if (promo.expiresAt && new Date() > promo.expiresAt)
    return res.status(400).json({ success: false, message: "Mã đã hết hạn" });

  if (orderValue < (promo.minOrderValue || 0))
    return res
      .status(400)
      .json({
        success: false,
        message: `Đơn hàng phải từ ${promo.minOrderValue}đ`,
      });

  let discount = 0;
  if (promo.discountType === "percent") {
    discount = (orderValue * promo.discountValue) / 100;
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  } else {
    discount = promo.discountValue;
  }

  res.json({ success: true, discount, promo });
};
