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
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      ref: "Order",
      required: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["MoMo", "PayPal", "Cash on Delivery"],
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      enum: ["USD", "VND"],
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled", "refunded"],
      default: "pending",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    hasRefund: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);