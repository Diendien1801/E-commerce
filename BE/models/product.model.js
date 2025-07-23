const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  description: String,
  imageUrl: [String],
  idCategory: Number,
  related: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  status: {
    type: String,
    enum: ["available", "out_of_stock"],
    default: "available",
  },
});

module.exports = mongoose.model("Product", productSchema);