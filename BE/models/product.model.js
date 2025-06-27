const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String],          // URLs of product images
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);