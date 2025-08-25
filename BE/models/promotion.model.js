const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: String,
    discountType: { type: String, enum: ["percent", "amount"], required: true }, // percent hoặc amount
    discountValue: { type: Number, required: true }, // % hoặc số tiền giảm
    minOrderValue: { type: Number, default: 0 }, // giá trị đơn tối thiểu
    maxDiscount: { type: Number }, // số tiền giảm tối đa (nếu là percent)
    expiresAt: { type: Date }, // ngày hết hạn
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
