const User = require("../models/user.model");
const Favorite = require("../models/favorite.model");
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


// Thêm sản phẩm vào danh sách yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { userID, productID } = req.body;
    if (!userID || !productID) {
      return res.status(400).json({ success: false, message: "Thiếu userID hoặc productID", data: null });
    }
    // Kiểm tra đã tồn tại chưa
    const existed = await Favorite.findOne({ userID, productID });
    if (existed) {
      return res.status(200).json({ success: true, message: "Đã yêu thích sản phẩm này", data: existed });
    }
    const favorite = await Favorite.create({ userID, productID });
    res.status(201).json({ success: true, message: "Đã thêm vào danh sách yêu thích", data: favorite });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", data: err.message });
  }
};

// Bỏ sản phẩm khỏi danh sách yêu thích
exports.removeFavorite = async (req, res) => {
  try {
    const { userID, productID } = req.body;
    if (!userID || !productID) {
      return res.status(400).json({ success: false, message: "Thiếu userID hoặc productID", data: null });
    }
    const deleted = await Favorite.findOneAndDelete({ userID, productID });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mục yêu thích để xóa", data: null });
    }
    res.status(200).json({ success: true, message: "Đã bỏ yêu thích sản phẩm", data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", data: err.message });
  }
};

// Lấy tất cả danh sách sản phẩm yêu thích của 1 người dùng
exports.getFavoritesByUser = async (req, res) => {
  try {
    const { userID } = req.params;
    if (!userID) {
      return res.status(400).json({ success: false, message: "Thiếu userID", data: null });
    }
    // Lấy danh sách favorite và populate thông tin sản phẩm
    const favorites = await Favorite.find({ userID }).populate("productID");
    res.status(200).json({ success: true, message: "Lấy danh sách sản phẩm yêu thích thành công", data: favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", data: err.message });
  }
};

