const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Change avatar
exports.changeAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar || typeof avatar !== "string") {
      return res.status(400).json({ error: "Avatar URL is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update avatar
    user.avatar = avatar;

    await user.save();

    res.json({
      message: "Avatar updated successfully.",
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Mật khẩu hiện tại không đúng" });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the updated user
    await user.save();

    res.json({ message: "Mật khẩu đã được cập nhật" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};