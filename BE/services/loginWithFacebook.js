const axios = require("axios");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports = async function loginWithFacebook(access_token) {
  console.log("🔹 [FB Login] Bắt đầu xử lý đăng nhập Facebook");

  if (!access_token) {
    console.log("❌ [FB Login] Thiếu access_token");
    throw new Error("Thiếu access_token");
  }

  console.log(
    "🔹 [FB Login] Access token nhận được:",
    access_token.substring(0, 20) + "..."
  );

  try {
    // Lấy thông tin user từ Facebook
    console.log("🔹 [FB Login] Đang gọi Facebook Graph API...");
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`
    );

    console.log(
      "✅ [FB Login] Facebook API response:",
      JSON.stringify(fbRes.data, null, 2)
    );
    const { id, name, email, picture } = fbRes.data;

    console.log("🔹 [FB Login] Thông tin từ Facebook:");
    console.log("  - ID:", id);
    console.log("  - Name:", name);
    console.log("  - Email:", email || "KHÔNG CÓ EMAIL");
    console.log("  - Picture URL:", picture?.data?.url || "KHÔNG CÓ ẢNH");

    // Tìm hoặc tạo user trong database
    console.log(
      "🔹 [FB Login] Đang tìm user trong database với facebookId:",
      id
    );
    let user = await User.findOne({ facebookId: id });

    if (!user) {
      console.log("🔹 [FB Login] Không tìm thấy user, đang tạo mới...");
      user = await User.create({
        facebookId: id,
        name,
        email,
        avatar: picture?.data?.url,
      });
      console.log("✅ [FB Login] Tạo user mới thành công:", {
        _id: user._id,
        facebookId: user.facebookId,
        name: user.name,
        email: user.email ,
      });
    } else {
      console.log("✅ [FB Login] Tìm thấy user đã tồn tại:", {
        _id: user._id,
        facebookId: user.facebookId,
        name: user.name,
        email: user.email,
      });
    }

    // Tạo JWT token
    console.log("🔹 [FB Login] Đang tạo JWT token...");
    const tokenPayload = { userId: user._id, facebookId: id };
    console.log("🔹 [FB Login] Token payload:", tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    console.log("✅ [FB Login] JWT token đã tạo thành công");
    console.log("🔹 [FB Login] Token preview:", token.substring(0, 30) + "...");

    const result = {
      user,
      token,
    };

    console.log("✅ [FB Login] Hoàn thành đăng nhập Facebook thành công");
    return result;
  } catch (error) {
    console.error("❌ [FB Login] Lỗi trong quá trình xử lý:");
    console.error("  - Message:", error.message);
    console.error("  - Status:", error.response?.status);
    console.error("  - Data:", error.response?.data);
    console.error("  - Stack:", error.stack);

    if (error.response?.status === 400) {
      console.error(
        "🚨 [FB Login] Access token có thể đã hết hạn hoặc không hợp lệ"
      );
    }

    throw error;
  }
};
