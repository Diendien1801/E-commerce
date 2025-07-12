const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  avatar: {
    type: String,
    match: [
      /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
      "Invalid URL format for avatar"
    ]
  },
  password: {type: String, required: true},
  
  googleId: { type: String, unique: true, sparse: true},
  isVerified: { type: Boolean, default: false},
});

module.exports = mongoose.model("User", userSchema);
