const Product = require("../models/product.model");

// Helper: Base filter to exclude deleted products
const baseFilter = { status: { $ne: 'deleted' } };

// Default collation for Vietnamese alphabetical order
const viCollation = { locale: 'vi', strength: 1 };

// FEATURE: SHOW IMAGES
// API: Returns all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(baseFilter)
      .collation(viCollation)
      .sort({ title: 1 });
    return res.status(200).json({ status: 200, success: true, message: 'All products retrieved successfully', data: products });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error retrieving products: ' + err.toString(), data: null });
  }
};

// API: Return n products per page
exports.getProductsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(baseFilter);
    const products = await Product.find(baseFilter)
      .collation(viCollation)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ status: 200, success: true, message: 'Products paginated successfully', data: { page, limit, total, products } });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error paginating products: ' + err.toString(), data: null });
  }
};

// FEATURE: FILTER PRODUCTS
// API: Filter products (price low to high, price high to low, newest)
exports.filterProducts = async (req, res) => {
  try {
    const { sort } = req.query;
    let sortOption;
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1, title: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1, title: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1, title: 1 };
        break;
      default:
        sortOption = { title: 1 };
    }
    const products = await Product.find(baseFilter)
      .collation(viCollation)
      .sort(sortOption);
    return res.status(200).json({ status: 200, success: true, message: 'Products filtered successfully', data: products });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error filtering products: ' + err.toString(), data: null });
  }
};

// FEATURE: SEARCH PRODUCT
// API: Search products by name
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');
    const filter = { ...baseFilter, title: regex };
    const products = await Product.find(filter)
      .collation(viCollation)
      .sort({ title: 1 });
    return res.status(200).json({ status: 200, success: true, message: 'Search results retrieved successfully', data: products });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error searching products: ' + err.toString(), data: null });
  }
};

// FEATURE: VIEW PRODUCT DETAILS
// API: View product details by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ...baseFilter });
    if (!product) return res.status(404).json({ status: 404, success: false, message: 'Product not found', data: null });
    return res.status(200).json({ status: 200, success: true, message: 'Product details retrieved successfully', data: product });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error retrieving product details: ' + err.toString(), data: null });
  }
};

// FEATURE: FILTER AND PAGINATE PRODUCTS
// API: Combined filter, sort, search, and pagination
exports.filterAndPaginateProducts = async (req, res) => {
  try {
    const { sort, page = 1, limit = 10, q } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { ...baseFilter };
    if (q) filter.title = new RegExp(q, 'i');

    // Build sort options
    let sortOption;
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1, title: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1, title: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1, title: 1 };
        break;
      default:
        sortOption = { title: 1 };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .collation(viCollation)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({ status: 200, success: true, message: 'Products filtered and paginated successfully', data: { page: pageNum, limit: limitNum, total, products } });
  } catch (err) {
    return res.status(500).json({ status: 500, success: false, message: 'Error filtering and paginating products: ' + err.toString(), data: null });
  }
};
