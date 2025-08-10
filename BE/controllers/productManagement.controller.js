const Product = require("../models/product.model");

//---------------------------------- ADMIN ------------------------------------------------
// API: Get all product (admin) paginated + summary
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const totalProducts = await Product.countDocuments();
    const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limitNumber);

    // Summary
    const totalAvailableProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
      status: "available"
    });
    const totalOutOfStockProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
      status: "out_of_stock"
    });
    const totalDeletedProducts = await Product.countDocuments({ isDeleted: true });
    const totalAllProducts = await Product.countDocuments({});

    const totalStockQuantityAgg = await Product.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
    ]);
    const totalStockQuantity = totalStockQuantityAgg[0]?.totalQuantity || 0;

    return res.status(200).json({
      status: 200,
      success: true,
      message: "All products retrieved successfully",
      data: {
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalProducts,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        },
        summary: {
          totalAvailableProducts,
          totalOutOfStockProducts,
          totalDeletedProducts,
          totalAllProducts,
          totalStockQuantity
        },
        products
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Error retrieving products: " + err.toString(),
      data: null
    });
  }
};
