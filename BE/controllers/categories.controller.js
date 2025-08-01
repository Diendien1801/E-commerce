const Category = require("../models/categories.model");
// Lấy tất cả categories theo dạng cha-con
exports.getAllCategoriesHierarchy = async (req, res) => {
  try {
    // Lấy categories cha (parentID = null)
    const parentCategories = await Category.find({ parentID: null })
      .select("idCategory nameCategory image")
      .sort({ idCategory: 1 });

    // Lấy tất cả categories con
    const childCategories = await Category.find({ parentID: { $ne: null } })
      .select("idCategory nameCategory parentID image")
      .sort({ idCategory: 1 });

    // Group categories con theo parentID
    const childrenByParent = {};
    childCategories.forEach((child) => {
      if (!childrenByParent[child.parentID]) {
        childrenByParent[child.parentID] = [];
      }
      childrenByParent[child.parentID].push({
        idCategory: child.idCategory,
        name: child.nameCategory,
        url: `/shop?category=${child.idCategory}`,
        image: child.image,
      });
    });

    // Kết hợp categories cha với con
    const hierarchyData = parentCategories.map((parent) => ({
      idCategory: parent.idCategory,
      name: parent.nameCategory,
      url: `/shop?parent=${parent.idCategory}`,
      image: parent.image,
      children: childrenByParent[parent.idCategory] || [],
    }));

    res.status(200).json({
      success: true,
      message: "Categories hierarchy retrieved successfully",
      data: hierarchyData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message,
    });
  }
};

// Lấy thông tin category theo ID 
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
        data: null,
      });
    }

    const category = await Category.findOne({ idCategory: id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: {
        idCategory: category.idCategory,
        name: category.nameCategory,
        parentID: category.parentID,
        image: category.image,
        description: category.description,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message,
    });
  }
};