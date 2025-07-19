const axios = require("axios");

const ESMS_API_KEY =
  process.env.ESMS_API_KEY || "CCC708E1D85ACFFF3F2916FFE21DD6";
const ESMS_SECRET_KEY = process.env.ESMS_SECRET_KEY || "2E3539720F491D875B86C2015BDFDF";
const ESMS_BRANDNAME = process.env.ESMS_BRANDNAME || "Baotrixemay"; // hoặc tên brand bạn đăng ký

const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone || !phone.startsWith("0")) {
    return res.status(400).json({
      success: false,
      message: "Số điện thoại phải bắt đầu bằng 0",
      error: "Invalid phone format",
    });
  }
  const otp = generateOTP();
  otpStore[phone] = otp;
  try {
    const response = await axios.post(
      "https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/",
      {
        ApiKey: ESMS_API_KEY,
        Content: `CODE la ma xac minh dang ky Baotrixemay cua ban`,
        Phone: phone,
        SecretKey: ESMS_SECRET_KEY,
        Brandname: ESMS_BRANDNAME,
        SmsType: "2",
        IsUnicode: "0",
        campaignid: "Cảm ơn sau mua hàng tháng 7",
        RequestId: "test-" + Date.now(),
        CallbackUrl: "https://esms.vn/webhook/",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.CodeResult === 100) {
      res.json({
        success: true,
        message:
          "Gửi OTP thành công. Vui lòng kiểm tra tin nhắn trên điện thoại.",
        phone: phone,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Gửi OTP thất bại.",
        error: response.data.ErrorMessage,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gửi OTP thất bại. Vui lòng thử lại sau.",
      error: err.message,
    });
  }
};

exports.verifyOTP = (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    return res.json({
      success: true,
      message: "Xác thực OTP thành công.",
      phone: phone,
    });
  }
  res.status(400).json({
    success: false,
    message: "OTP không đúng hoặc đã hết hạn.",
    error: "Invalid or expired OTP",
  });
};
