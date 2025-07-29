const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    warehouseId: {
      type: Number,
      required: true,
      default: 1,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    
    
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
inventorySchema.index({ warehouseId: 1, productId: 1 }, { unique: true });
inventorySchema.index({ productId: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
