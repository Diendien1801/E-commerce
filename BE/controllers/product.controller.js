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

//FEATURE: SEARCH PRODUCT
//API: Search products by name
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query; 

    const regex = new RegExp(q, 'i');

    const products = await Product.find({
      name: regex
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
