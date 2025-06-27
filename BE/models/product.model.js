const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  imageUrl: String,
  productUrl: String,
  source: String,
});

module.exports = mongoose.model("Product", productSchema);
