const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports = async function loginWithFacebook(access_token) {
  if (!access_token) throw new Error("Thiếu access_token");

  // Lấy thông tin user từ Facebook
  const fbRes = await axios.get(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
  );
  const { id, name, email, picture } = fbRes.data;

  // Tìm hoặc tạo user trong database
  let user = await User.findOne({ facebookId: id });
  if (!user) {
    user = await User.create({
      facebookId: id,
      name,
      email,
      avatar: picture?.data?.url,
    });
  }

  // Tạo JWT token
  const token = jwt.sign(
    { userId: user._id, facebookId: id },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );

  return {
    user,
    token,
  };
};
