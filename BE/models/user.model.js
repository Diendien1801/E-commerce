const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: function () {
        // Password chỉ bắt buộc nếu không có facebookId
        return !this.facebookId;
      },
    },
    avatar: {
      type: String,
      match: [
        /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
        "Invalid URL format for avatar",
      ],
      default: null,
    },
    facebookId: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: () => uuidv4() },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,

    // ========== THÔNG TIN CÁ NHÂN ==========
    phoneNumber: {
      type: String,
      default: null,
      match: [/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"],
      sparse: true, // Cho phép null nhưng unique nếu có giá trị
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Họ tên không được quá 100 ký tự"],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value < new Date(); // Không được là ngày tương lai
        },
        message: "Ngày sinh không hợp lệ",
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    address: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, default: "Vietnam" },
      zipCode: { type: String, trim: true },
      // Địa chỉ đầy đủ dạng string để dễ tìm kiếm
      fullAddress: { type: String, trim: true },
    },

    // Trạng thái tài khoản
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes cho performance
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 }, { sparse: true });
userSchema.index({ isDeleted: 1, status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ fullName: "text", "address.fullAddress": "text" });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Chỉ hash password nếu có password và password đã được modify
  if (!this.password || !this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Tự động tạo fullAddress khi có thay đổi address
userSchema.pre("save", function (next) {
  if (this.isModified("address") && this.address) {
    const addressParts = [
      this.address.street,
      this.address.ward,
      this.address.district,
      this.address.city,
      this.address.country,
    ].filter(Boolean);

    this.address.fullAddress = addressParts.join(", ");
  }
  next();
});

// Compare plain text password with hashed
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false; // Không có password thì return false
  return bcrypt.compare(candidatePassword, this.password);
};

// Method để lấy thông tin cơ bản (không bao gồm sensitive data)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    fullName: this.fullName,
    email: this.email,
    avatar: this.avatar,
    dateOfBirth: this.dateOfBirth,
    gender: this.gender,
    createdAt: this.createdAt,
  };
};

// Method để check xem có phải sinh nhật không
userSchema.methods.isBirthday = function () {
  if (!this.dateOfBirth) return false;

  const today = new Date();
  const birthday = new Date(this.dateOfBirth);

  return (
    today.getMonth() === birthday.getMonth() &&
    today.getDate() === birthday.getDate()
  );
};

// Static method để tìm users theo tuổi
userSchema.statics.findByAgeRange = function (minAge, maxAge) {
  const today = new Date();
  const maxBirthDate = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  );
  const minBirthDate = new Date(
    today.getFullYear() - maxAge,
    today.getMonth(),
    today.getDate()
  );

  return this.find({
    dateOfBirth: {
      $gte: minBirthDate,
      $lte: maxBirthDate,
    },
    isDeleted: { $ne: true },
  });
};

// Virtual để tính tuổi
userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;

  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
