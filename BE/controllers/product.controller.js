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
exports.filterAndPaginateProducts = async (req, res) => {
  try {
    const { sort, page = 1, limit = 10, q } = req.query;
    let sortOption = {};
    let filter = {};

    // Lọc theo tên sản phẩm nếu có q
    if (q) {
      filter.title = new RegExp(q, "i");
    }

    // Sắp xếp
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

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      products,
    });
  } catch (err) {
    res.status(500).json({
      error: "Lỗi lọc và phân trang sản phẩm",
      detail: err.toString(),
      stack: err.stack,
    });
  }
};

// API: Lấy sản phẩm theo idCategory với phân trang và sort
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sort = 'newest'
    } = req.query;

    // Convert sang number
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const categoryIdNumber = parseInt(categoryId);

    // Build filter object
    let filter = {};

    // Filter theo idCategory - logic theo pattern bạn mô tả
    if (categoryIdNumber >= 100) {
      // Nếu categoryId >= 100 thì tìm chính xác (ví dụ: 201 -> 201)
      filter.idCategory = categoryIdNumber;
    } else {
      // Nếu categoryId < 100 thì tìm pattern (ví dụ: 1 -> 10x, 2 -> 20x)
      const startPattern = categoryIdNumber * 100;
      const endPattern = startPattern + 99;
      filter.idCategory = { 
        $gte: startPattern, 
        $lte: endPattern 
      };
    }

    // Sort options (chỉ 3 loại)
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute queries
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        },
        filters: {
          categoryId: categoryIdNumber,
          sort
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy sản phẩm theo danh mục",
      detail: error.message
    });
  }
};