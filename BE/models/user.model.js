const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: String,
  avatar: String,
  facebookId: String, // Thêm trường này
  // ... các trường khác nếu cần

  email: { type: String, unique: true },
  role: { type: String, enum: ['admin', 'user'], required: true },

});

module.exports = mongoose.model("User", userSchema);
