const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: [
        "Credit Card",
        "VNPay",
        "Momo",
        "ZaloPay",
        "Bank Transfer",
        "Cash on Delivery",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
