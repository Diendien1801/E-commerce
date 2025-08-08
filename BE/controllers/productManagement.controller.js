const Product = require("../models/product.model"); // đường dẫn tuỳ project

// API: Lấy danh sách tất cả product với phân trang, filter, sort và summary
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all", // all, available, out_of_stock, deleted
      idCategory, // optional: số hoặc chuỗi số
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice, // optional
      maxPrice, // optional
    } = req.query;

    // Convert sang number
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    let filter = {};

    // Search filter (title, description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter (nếu có)
    if (typeof idCategory !== "undefined" && idCategory !== "") {
      const catNum = Number(idCategory);
      if (!Number.isNaN(catNum)) {
        filter.idCategory = catNum;
      } else {
        // Nếu idCategory là ObjectId string, bạn có thể dùng filter.idCategory = idCategory;
        filter.idCategory = idCategory;
      }
    }

    // Price range filter (nếu có)
    if (typeof minPrice !== "undefined" || typeof maxPrice !== "undefined") {
      filter.price = {};
      if (typeof minPrice !== "undefined" && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (typeof maxPrice !== "undefined" && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
      // Nếu cả hai không hợp lệ, xoá filter.price
      if (Object.keys(filter.price).length === 0) delete filter.price;
    }

    // Status filter
    switch (status) {
      case "available":
        filter.isDeleted = { $ne: true };
        filter.status = "available";
        break;
      case "out_of_stock":
        filter.isDeleted = { $ne: true };
        filter.status = "out_of_stock";
        break;
      case "deleted":
        filter.isDeleted = true;
        break;
      case "all":
      default:
        // Không filter gì thêm
        break;
    }

    // Sort options
    const sortOptions = {};
    // đảm bảo sortOrder chỉ là desc hoặc asc
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Lấy products với phân trang
    const products = await Product.find(filter)
      .select(
        "title price description imageUrl idCategory related status isDeleted quantity createdAt updatedAt"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Đếm tổng số products theo filter
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / limitNumber);

    // Thống kê tổng quan
    const totalAvailableProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
      status: "available",
    });
    const totalOutOfStockProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
      status: "out_of_stock",
    });
    const totalDeletedProducts = await Product.countDocuments({ isDeleted: true });
    const totalAllProducts = await Product.countDocuments({});

    // (Tuỳ: có thể tính tổng quantity hiện có)
    const totalStockQuantityAgg = await Product.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);
    const totalStockQuantity = totalStockQuantityAgg[0]?.totalQuantity || 0;

    res.status(200).json({
      success: true,
      data: {
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalProducts: totalProducts,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        summary: {
          totalAvailableProducts,
          totalOutOfStockProducts,
          totalDeletedProducts,
          totalAllProducts,
          totalStockQuantity,
        },
        products,
      },
    });
  } catch (error) {
    console.error("Error getAllProducts:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách sản phẩm",
      detail: error.message,
    });
  }
};