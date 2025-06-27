const Product = require('../models/product.model');

//FEATURE: SHOW IMAGES
//API: Returns all productS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// API: Return n products per page
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

//FEATURE: FILTER PRODUCTS
// API: Filter products (price low to high, price high to low, newest)
exports.filterProducts = async (req, res) => {
  try {
    const { sort } = req.query;
    let sortOption = {};

    switch (sort) {
      // price low to high
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      // price high to low
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      // newest products
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      //default
      default:
        sortOption = {};
    }

    const products = await Product.find().sort(sortOption);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
