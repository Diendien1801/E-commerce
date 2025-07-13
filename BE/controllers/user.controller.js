const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const user = await User.create(data);
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

    const user = await User.findById(req.body._id);
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
    const user = await User.findById(req.body._id);
    
    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "The current password is incorrect." });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save the updated user
    await user.save();

    res.json({ message: "The password has been updated." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};