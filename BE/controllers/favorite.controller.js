const Favorite = require("../models/favorite.model");

// Toggle favorite: add or remove
exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      await existing.remove();
      return res.json({ isFavorite: false, message: "Đã bỏ thích" });
    }

    await new Favorite({ userId, productId }).save();
    res.json({ isFavorite: true, message: "Đã thích" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all favorite products
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate("productId");
    // Return product list
    res.json(favorites.map(f => f.productId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove favorite product and return the updated list
exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId       = req.user._id;

    const deleted = await Favorite.findOneAndDelete({ userId, productId });
    if (!deleted) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm trong favorites" });
    }

    // Get updated favorites list after deletion
    const favorites = await Favorite.find({ userId }).populate("productId");
    res.json({
      message: "Đã xóa khỏi yêu thích",
      favorites: favorites.map(f => f.productId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
