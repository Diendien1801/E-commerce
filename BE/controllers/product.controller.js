const Product = require('../models/product.model');

//API: Trả về tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: Trả về n sản phẩm trên 1 trang (phân trang)
exports.getProductsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      total,
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


