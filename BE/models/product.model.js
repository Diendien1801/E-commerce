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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  //new
  quantity: { type: Number, default: 0, min: [0, 'Quantity cannot be negative'] },
},
{
  timestamps: true // Automatically manage createdAt and updatedAt fields (filter)
});

module.exports = mongoose.model("Product", productSchema);