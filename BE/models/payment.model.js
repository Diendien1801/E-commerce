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
    currency: {
      type: String,
      default: "VND",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String, // ID từ payment gateway (VNPay, Momo, etc.)
      default: null,
    },
    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Lưu response từ gateway
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
paymentSchema.index({ userId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Method để update payment status
paymentSchema.methods.updateStatus = function (
  status,
  transactionId = null,
  gatewayResponse = null
) {
  this.status = status;
  if (transactionId) this.transactionId = transactionId;
  if (gatewayResponse) this.paymentGatewayResponse = gatewayResponse;

  if (status === "completed") {
    this.paidAt = new Date();
  }

  return this.save();
};

// Method để refund
paymentSchema.methods.processRefund = function (refundAmount, reason = null) {
  this.status = "refunded";
  this.refundAmount = refundAmount;
  this.refundedAt = new Date();
  if (reason) this.notes = reason;

  return this.save();
};

// Static method để tạo payment ID
paymentSchema.statics.generatePaymentId = function () {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY${timestamp.slice(-6)}${random}`;
};

module.exports = mongoose.model("Payment", paymentSchema);