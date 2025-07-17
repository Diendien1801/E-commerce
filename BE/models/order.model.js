const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  idOrder: { type: String, required: true, unique: true },
  idUser: { type: String, required: true },
  items: [
    {
      productID: {type: String, required: true},
      quantity: {type: Number,required: true,min: 1},
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],
  status: { type: String, enum: ['pending', 'canceled', 'complete'], default: 'pending' },
  paymentMethod: { type: String, required: true},
  shippingAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
