const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    idCategory: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    nameCategory: {
      type: String,
      required: true,
      trim: true,
    },
    parentID: {
      type: Number,
      required: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "categories",
  }
);

// Index compound cho tìm kiếm theo parentID
categorySchema.index({ parentID: 1, idCategory: 1 });

// Static method để lấy categories theo parentID
categorySchema.statics.getByParentID = async function (parentID) {
  return await this.find({ parentID }).sort({ idCategory: 1 });
};

// Static method để lấy tất cả categories
categorySchema.statics.getAllCategories = async function () {
  return await this.find({}).sort({ parentID: 1, idCategory: 1 });
};

// Static method để lấy category theo idCategory
categorySchema.statics.getByIdCategory = async function (idCategory) {
  return await this.findOne({ idCategory });
};

module.exports = mongoose.model("Category", categorySchema);
