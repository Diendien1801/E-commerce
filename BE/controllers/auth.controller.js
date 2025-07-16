const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/mailer');
require('dotenv').config();

// User registration (name, pass and email)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already in use', data: null });
    }

    const user = new User({ name, email, password });
    await user.save();
    await sendVerificationEmail(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful, please check your email to verify.',
      data: { userId: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: err.message });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token', data: null });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.', data: null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: err.message });
  }
};

// User login
exports.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials', data: null });
    }
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Email not verified', data: null });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ success: true, message: 'Login successful', data: { token }});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', data: err.message });
  }
};