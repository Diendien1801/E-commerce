const User = require("../models/user.model");

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadUserAvatar = async (req, res) => {
  try {
    const { userId, avatarUrl } = req.body;
    if (!userId || !avatarUrl) {
      return res.status(400).json({ success: false, message: "Thiếu userId hoặc avatarUrl", data: null });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user", data: null });
    res.status(200).json({ success: true, message: "Upload avatar thành công", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", data: err.message });
  }
};

