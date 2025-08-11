const Product = require("../models/product.model");

// Helper: Base filter to exclude deleted products
const baseFilter = { isDeleted: { $ne: true } };

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

// ADMIN: Search products by name
exports.searchProductsAdmin = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Query parameter 'q' is required",
        data: null,
      });
    }

    // Build search filter - không dùng baseFilter để search cả deleted products
    const regex = new RegExp(q, "i");
    const filter = { title: regex };

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(filter)
        .collation(viCollation)
        .sort({ title: 1 })
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      status: 200,
      success: true,
      message: `Found ${total} product(s) matching "${q}"`,
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalProducts: total,
          productsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        searchQuery: q,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Error searching products: " + err.toString(),
      data: null,
    });
  }
};

// FEATURE: VIEW PRODUCT DETAILS
// API: View product details by ID
exports.getProductById = async (req, res) => {
  try {
    const Inventory = require("../models/inventory.model");

    const product = await Product.findOne({
      _id: req.params.id,
      ...baseFilter,
    });
    if (!product) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    // Lấy thông tin tồn kho
    const inventory = await Inventory.findOne({ productId: product._id });

    // Thêm thông tin tồn kho vào product data
    const productWithInventory = {
      ...product.toObject(),
      inventory: {
        currentStock: inventory ? inventory.quantity : 0,
        warehouseId: inventory ? inventory.warehouseId : null,
        lastUpdated: inventory ? inventory.updatedAt : null,
      },
    };

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Product details retrieved successfully",
      data: productWithInventory,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Error retrieving product details: " + err.toString(),
      data: null,
    });
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

//ADMIN
// Create a new product
// exports.createProduct = async (req, res) => {
//   try {
//     const { title, price, description, imageUrl, idCategory, related, status, quantity } = req.body;
//     const newProduct = new Product({ title, price, description, imageUrl, idCategory, related, status, quantity });
//     const saved = await newProduct.save();
//     return res.status(201).json({ status: 201, success: true, message: 'Product created successfully', data: saved });
//   } catch (err) {
//     console.error('createProduct error:', err);
//     // Handle validation errors
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ status: 400, success: false, message: err.message, data: null });
//     }
//     return res.status(500).json({ status: 500, success: false, message: 'Server error while creating product', data: null });
//   }
// };


// Update an existing product by ID
// exports.updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
//     const updated = await Product.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true, context: 'query' }
//     );
//     if (!updated) {
//       return res.status(404).json({ status: 404, success: false, message: 'Product not found', data: null });
//     }
//     return res.status(200).json({ status: 200, success: true, message: 'Product updated successfully', data: updated });
//   } catch (err) {
//     console.error('updateProduct error:', err);
//     // If validation error
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ status: 400, success: false, message: err.message, data: null });
//     }
//     return res.status(500).json({ status: 500, success: false, message: 'Server error while updating product', data: null });
//   }
// };

// // "Delete" a product by setting its status to 'deleted'
// exports.deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ status: 404, success: false, message: 'Product not found', data: null });
//     }
//     product.status = 'deleted';
//     const saved = await product.save();
//     return res.status(200).json({ status: 200, success: true, message: 'Product deleted (status set to deleted)', data: saved });
//   } catch (err) {
//     console.error('deleteProduct error:', err);
//     return res.status(500).json({ status: 500, success: false, message: 'Server error while deleting product', data: null });
//   }
// };

//ADMIN
// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { title, price, description, imageUrl, idCategory, related, status, quantity } = req.body;
    const newProduct = new Product({ title, price, description, imageUrl, idCategory, related, status, quantity });
    const saved = await newProduct.save();
    return res.status(201).json({ status: 201, success: true, message: 'Product created successfully', data: saved });
  } catch (err) {
    console.error('createProduct error:', err);
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 400, success: false, message: err.message, data: null });
    }
    return res.status(500).json({ status: 500, success: false, message: 'Server error while creating product', data: null });
  }
};


// Update an existing product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) {
      return res.status(404).json({ status: 404, success: false, message: 'Product not found', data: null });
    }
    return res.status(200).json({ status: 200, success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    console.error('updateProduct error:', err);
    // If validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 400, success: false, message: err.message, data: null });
    }
    return res.status(500).json({ status: 500, success: false, message: 'Server error while updating product', data: null });
  }
};

// API: Soft delete product
exports.softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found",
        data: null
      });
    }

    // Kiểm tra nếu đã bị xóa
    if (product.isDeleted) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Product already deleted",
        data: null
      });
    }

    // Soft delete - chỉ thay đổi isDeleted
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Product soft deleted successfully",
      data: {
        productId: product._id,
        title: product.title,
        isDeleted: product.isDeleted,
        deletedAt: product.deletedAt
      }
    });

  } catch (error) {
    console.error('softDeleteProduct error:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error while soft deleting product",
      data: null
    });
  }
};

// API: Restore product
exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm product bị xóa
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Product not found",
        data: null
      });
    }

    // Kiểm tra nếu chưa bị xóa
    if (!product.isDeleted) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Product is not deleted",
        data: null
      });
    }

    // Restore product - chỉ thay đổi isDeleted
    product.isDeleted = false;
    product.deletedAt = null;
    await product.save();

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Product restored successfully",
      data: {
        productId: product._id,
        title: product.title,
        isDeleted: product.isDeleted,
        restoredAt: new Date()
      }
    });

  } catch (error) {
    console.error('restoreProduct error:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Server error while restoring product",
      data: null
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
// API: Get all product (admin) paginated
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      status: 200,
      success: true,
      message: 'All products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalProducts / limitNumber),
          totalProducts,
          limit: limitNumber,
          hasNextPage: skip + limitNumber < totalProducts,
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: 'Error retrieving products: ' + err.toString(),
      data: null
    });
  }
}

// API get product by id (detail product admin)
exports.getProductByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Product not found',
        data: null
      });
    }
    return res.status(200).json({
      status: 200,
      success: true,
      message: 'Product details retrieved successfully',
      data: product
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: 'Error retrieving product details: ' + err.toString(),
      data: null
    });
  }
};
