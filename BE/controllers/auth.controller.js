const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../utils/mailer");
require("dotenv").config();

// User registration (name, pass and email)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use", data: null });
    }

    // Tạo token xác thực email
    const verificationToken = require("crypto").randomBytes(32).toString("hex");

    const user = new User({
      name,
      email,
      password,
      avatar:
        "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
      verificationToken,
      isVerified: false,
    });

    await user.save();
    await sendVerificationEmail(user);

    res.status(201).json({
      success: true,
      message: "Registration successful, please check your email to verify.",
      data: { userId: user._id, email: user.email },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: err.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect(
        `https://localhost:3000/login?status=error&message=${encodeURIComponent(
          "Invalid or expired verification link"
        )}`
      );
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return res.redirect(
      `https://localhost:3000/login?status=success&message=${encodeURIComponent(
        "Email verified successfully. You can now log in."
      )}`
    );
  } catch (err) {
    return res.redirect(
      `https://localhost:3000/login?status=error&message=${encodeURIComponent(
        "Server error, please try again later"
      )}`
    );
  }
};

// User login
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not registered. Please sign up.",
        data: null,
      });
    }

    // Kiểm tra tài khoản đã bị xóa chưa
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản này đã bị xóa hoặc bị khóa. Vui lòng liên hệ quản trị viên.",
        data: null,
      });
    }

    if (!user.isVerified) {
      try {
        await sendVerificationEmail(user);
        return res.status(401).json({
          success: false,
          message: "Email not verified! Verification email sent, please check your email.",
          data: null,
        });
      } catch (mailErr) {
        console.error("sendVerificationEmail error:", mailErr);
        return res.status(500).json({
          success: false,
          message: "Unable to send verification email. Please try again later.",
          data: null,
        });
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
        data: null
      });
    }

    // Include role in JWT payload
    const payload = { 
      id: user._id, 
      email: user.email,
      role: user.role // Thêm role vào token
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role, // Trả về role
          avatar: user.avatar,
          isVerified: user.isVerified
        }
      }
    });

  } catch (err) {
    console.error("loginWithEmail error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      data: err.message,
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email is registered, you will receive a reset link shortly.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await sendResetPasswordEmail(user);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", data: err.message });
  }
};
