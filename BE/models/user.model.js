const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
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
  },
  { timestamps: true }
);

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

// Compare plain text password with hashed
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false; // Không có password thì return false
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);