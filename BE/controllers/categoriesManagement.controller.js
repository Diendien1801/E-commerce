const Category = require("../models/categories.model");

// API: Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const { idCategory, nameCategory, parentID, image, description } = req.body;

    // Validate required fields
    if (!idCategory || !nameCategory) {
      return res.status(400).json({
        success: false,
        message: "idCategory and nameCategory are required",
        data: null,
      });
    }

    // Kiểm tra idCategory đã tồn tại chưa
    const existingCategory = await Category.findOne({ idCategory });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category ID already exists",
        data: null,
      });
    }

    // Nếu có parentID, kiểm tra parent category có tồn tại không
    if (parentID) {
      const parentCategory = await Category.findOne({ idCategory: parentID });
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
          data: null,
        });
      }
    }

    // Tạo category mới
    const newCategory = new Category({
      idCategory,
      nameCategory,
      parentID: parentID || null,
      image: image || null,
      description: description || null,
      isDeleted: false,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating category",
      data: null,
    });
  }
};

// API: Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameCategory, parentID, image, description } = req.body;

    // Tìm category
    const category = await Category.findOne({ idCategory: id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Kiểm tra category đã bị xóa chưa
    if (category.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot update deleted category",
        data: null,
      });
    }

    // Nếu có parentID, kiểm tra parent category
    if (parentID && parentID !== category.parentID) {
      // Không được set parent thành chính nó
      if (parentID === category.idCategory) {
        return res.status(400).json({
          success: false,
          message: "Category cannot be parent of itself",
          data: null,
        });
      }

      const parentCategory = await Category.findOne({ idCategory: parentID });
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
          data: null,
        });
      }
    }

    // Update fields
    if (nameCategory) category.nameCategory = nameCategory;
    if (parentID !== undefined) category.parentID = parentID || null;
    if (image !== undefined) category.image = image;
    if (description !== undefined) category.description = description;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating category",
      data: null,
    });
  }
};

// API: Soft delete category
exports.softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm category
    const category = await Category.findOne({ idCategory: id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Kiểm tra đã bị xóa chưa
    if (category.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Category already deleted",
        data: null,
      });
    }

    // Kiểm tra có category con không
    const childCategories = await Category.find({
      parentID: category.idCategory,
      isDeleted: { $ne: true },
    });

    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with active child categories",
        data: {
          childCount: childCategories.length,
          children: childCategories.map((child) => ({
            idCategory: child.idCategory,
            nameCategory: child.nameCategory,
          })),
        },
      });
    }

    // Soft delete
    category.isDeleted = true;
    category.deletedAt = new Date();
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category soft deleted successfully",
      data: {
        idCategory: category.idCategory,
        nameCategory: category.nameCategory,
        isDeleted: category.isDeleted,
        deletedAt: category.deletedAt,
      },
    });
  } catch (error) {
    console.error("softDeleteCategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      data: null,
    });
  }
};

// API: Restore category
exports.restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm category đã bị xóa
    const category = await Category.findOne({ idCategory: id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Kiểm tra đã bị xóa chưa
    if (!category.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Category is not deleted",
        data: null,
      });
    }

    // Nếu có parentID, kiểm tra parent category có active không
    if (category.parentID) {
      const parentCategory = await Category.findOne({
        idCategory: category.parentID,
        isDeleted: { $ne: true },
      });

      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Cannot restore: parent category not found or deleted",
          data: null,
        });
      }
    }

    // Restore
    category.isDeleted = false;
    category.deletedAt = null;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category restored successfully",
      data: {
        idCategory: category.idCategory,
        nameCategory: category.nameCategory,
        isDeleted: category.isDeleted,
        restoredAt: new Date(),
      },
    });
  } catch (error) {
    console.error("restoreCategory error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while restoring category",
      data: null,
    });
  }
};

// API: Get all categories với pagination (bao gồm deleted)
exports.getAllCategoriesForAdmin = async (req, res) => {
  try {
    const {
      status = "all", // all, active, deleted
      type = "all", // all, parent, child
      page = 1,
      limit = 10,
      sortBy = "idCategory",
      sortOrder = "asc",
    } = req.query;

    // Build filter
    let filter = {};

    // Filter by status
    switch (status) {
      case "active":
        filter.isDeleted = { $ne: true };
        break;
      case "deleted":
        filter.isDeleted = true;
        break;
      case "all":
      default:
        // Không filter theo deleted status
        break;
    }

    // Filter by type
    switch (type) {
      case "parent":
        filter.parentID = null;
        break;
      case "child":
        filter.parentID = { $ne: null };
        break;
      case "all":
      default:
        // Không filter theo type
        break;
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sort
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Execute queries
    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Category.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await Promise.all([
      Category.countDocuments({ isDeleted: { $ne: true } }),
      Category.countDocuments({ isDeleted: true }),
      Category.countDocuments({ parentID: null, isDeleted: { $ne: true } }),
      Category.countDocuments({
        parentID: { $ne: null },
        isDeleted: { $ne: true },
      }),
      Category.countDocuments({}),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      message: `Found ${total} categories`,
      data: {
        categories: categories,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalCategories: total,
          categoriesPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        filters: {
          status,
          type,
          sortBy,
          sortOrder,
        },
        statistics: {
          active: stats[0],
          deleted: stats[1],
          parentCategories: stats[2],
          childCategories: stats[3],
          total: stats[4],
        },
      },
    });
  } catch (error) {
    console.error("getAllCategoriesForAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving categories",
      data: null,
    });
  }
};

// API: Get category by ID (bao gồm deleted)
exports.getCategoryByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ idCategory: id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    // Get children (nếu có)
    let children = [];
    if (!category.parentID) {
      children = await Category.find({ parentID: category.idCategory });
    }

    // Get parent (nếu có)
    let parent = null;
    if (category.parentID) {
      parent = await Category.findOne({ idCategory: category.parentID });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: {
        category: category,
        children: children,
        parent: parent,
      },
    });
  } catch (error) {
    console.error("getCategoryByIdForAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving category",
      data: null,
    });
  }
};
