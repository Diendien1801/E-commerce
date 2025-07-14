const loginWithFacebook = require("../services/loginWithFacebook");

exports.facebookLogin = async (req, res) => {
  const { access_token } = req.body;
  try {
    const result = await loginWithFacebook(access_token);
    res.status(200).json({
      success: true,
      message: "Đăng nhập Facebook thành công",
      data: result, // { user, token }
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Đăng nhập Facebook thất bại",
      error: err.message,
      detail: err.response?.data || null,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
