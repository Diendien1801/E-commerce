const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      ref: "Payment",
      required: true,
    },

    userId: {
      type: String,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    refundedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    reason: {
      type: String,
      default: "No reason provided",
    },

    method: {
      type: String,
      required: true,
      enum: ["MoMo", "PayPal", "Cash on Delivery"],
    },

    refundGatewayId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["processing", "success", "failed"],
      default: "processing",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Refund", refundSchema);
