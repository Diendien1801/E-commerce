const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  //new
  avatar: {
    type: String,
    match: [
      /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
      "Invalid URL format for avatar"
    ],
    default: null
  },
  //new
  password: {type: String, required: true}
});

module.exports = mongoose.model("User", userSchema);
