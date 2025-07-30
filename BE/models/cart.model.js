const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Mỗi user chỉ có 1 giỏ hàng
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        priceAtTime: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
cartSchema.index({ userId: 1 });
cartSchema.index({ "items.productId": 1 });

// Middleware để update lastUpdated khi có thay đổi
cartSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual để tính tổng tiền giỏ hàng
cartSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.quantity * item.priceAtTime;
  }, 0);
});

// Virtual để tính tổng số lượng items
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Cart", cartSchema);
