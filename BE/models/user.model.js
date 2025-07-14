const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,
  facebookId: String, // Thêm trường này
  // ... các trường khác nếu cần
});

module.exports = mongoose.model("User", userSchema);
