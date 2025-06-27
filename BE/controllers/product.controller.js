const Product = require("../models/product.model");

//FEATURE: SHOW IMAGES
//API: Returns all productS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      error: "Lỗi lấy danh sách sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};

// API: Return n products per page
exports.getProductsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      page,
      limit,
      total,
      products,
    });
  } catch (err) {
    res.status(500).json({
      error: "Lỗi phân trang sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};

//FEATURE: FILTER PRODUCTS
// API: Filter products (price low to high, price high to low, newest)
exports.filterProducts = async (req, res) => {
  try {
    const { sort } = req.query;
    let sortOption = {};

    switch (sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = {};
    }

    const products = await Product.find().sort(sortOption);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      error: "Lỗi lọc sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};
//FEATURE: SEARCH PRODUCT
//API: Search products by name
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const regex = new RegExp(q, "i");

    const products = await Product.find({
      title: regex,
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({
      error: "Lỗi tìm kiếm sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};

//FEATURE: VIEW PRODUCT DETAILS
//API: View product details by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({
      error: "Lỗi lấy chi tiết sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};
