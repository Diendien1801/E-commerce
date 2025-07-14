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

// Change avatar
exports.changeAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar || typeof avatar !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required.',
        data: null
      });
    }

    const user = await User.findById(req.body._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null
      });
    }

    // Update avatar
    user.avatar = avatar;
    await user.save();

    return res.json({
      success: true,
      message: 'Avatar updated successfully.',
      data: { avatar: user.avatar }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: null
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.body._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null
      });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'The current password is incorrect.',
        data: null
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({
      success: true,
      message: 'The password has been updated.',
      data: null
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: null
    });
  }
};
