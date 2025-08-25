const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");
const request = require("request");
const Order = require("../models/order.model");
const Payment = require("../models/payment.model");

class VNPayController {
  // Kiểm tra cấu hình VNPay
  validateConfig() {
    const config = {
      tmnCode: process.env.VNP_TMN_CODE,
      secretKey: process.env.VNP_HASH_SECRET,
      vnpUrl: process.env.VNP_URL,
      returnUrl: process.env.VNP_RETURN_URL,
      apiUrl: process.env.VNP_API,
    };

    const missing = [];

    if (!config.tmnCode) missing.push("VNP_TMN_CODE");
    if (!config.secretKey) missing.push("VNP_HASH_SECRET");
    if (!config.vnpUrl) missing.push("VNP_URL");
    if (!config.returnUrl) missing.push("VNP_RETURN_URL");
    if (!config.apiUrl) missing.push("VNP_API");

    if (missing.length > 0) {
      console.error("Missing environment variables:", missing);
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }

    return config;
  }

  // Tạo URL thanh toán (cập nhật để nhận orderId từ frontend)
  createPaymentUrl = async (req, res) => {
    try {
      console.log("=== VNPay Create Payment URL Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // Validate cấu hình trước
      let config;
      try {
        config = this.validateConfig();
      } catch (configError) {
        console.error("=== VNPay Config Error ===");
        console.error("Config Error:", configError.message);
        return res.status(500).json({
          success: false,
          message: "Cấu hình VNPay không đầy đủ",
          error: configError.message,
        });
      }

      // Validate request body
      if (!req.body.amount || req.body.amount <= 0) {
        console.error("Invalid amount:", req.body.amount);
        return res.status(400).json({
          success: false,
          message: "Số tiền không hợp lệ",
        });
      }

      if (!req.body.idOrder) {
        console.error("Missing orderId");
        return res.status(400).json({
          success: false,
          message: "Thiếu mã đơn hàng",
        });
      }

      // Kiểm tra order có tồn tại không
      const order = await Order.findOne({ idOrder: req.body.idOrder });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();
      let createDate = moment(date).format("YYYYMMDDHHmmss");

      let ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let orderId = req.body.idOrder; // Sử dụng orderId từ frontend
      let amount = req.body.amount;
      let bankCode = req.body.bankCode || "";
      let orderInfo = req.body.orderInfo || `Thanh toan don hang: ${orderId}`;

      console.log("Payment Details:");
      console.log("- Order ID:", orderId);
      console.log("- Amount:", amount);
      console.log("- Bank Code:", bankCode);
      console.log("- Order Info:", orderInfo);

      // Tạo hoặc cập nhật Payment record
      let payment = await Payment.findOne({ orderId: orderId });
      if (!payment) {
        // Tạo payment mới với status pending
        payment = new Payment({
          id: `PAY_${orderId}_${Date.now()}`,
          userId: order.idUser,
          orderId: orderId,
          method: "VNPay",
          amount: amount,
          status: "pending",
        });
        await payment.save();
        console.log("Created new payment record:", payment.id);
      } else {
        // Reset payment về pending nếu đã tồn tại
        payment.status = "pending";
        payment.amount = amount;
        await payment.save();
        console.log("Updated existing payment record:", payment.id);
      }

      let locale = req.body.language;
      if (locale === null || locale === "" || locale === undefined) {
        locale = "vn";
      }

      let currCode = "VND";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = config.tmnCode;
      vnp_Params["vnp_Locale"] = locale;
      vnp_Params["vnp_CurrCode"] = currCode;
      vnp_Params["vnp_TxnRef"] = orderId;
      vnp_Params["vnp_OrderInfo"] = orderInfo;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = amount * 100;
      vnp_Params["vnp_ReturnUrl"] = config.returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;

      if (bankCode !== null && bankCode !== "") {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", config.secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      vnp_Params["vnp_SecureHash"] = signed;
      let vnpUrl =
        config.vnpUrl +
        "?" +
        querystring.stringify(vnp_Params, { encode: false });

      console.log("Final Payment URL:", vnpUrl);
      console.log("=== VNPay Create Payment URL Completed ===");

      res.status(200).json({
        success: true,
        data: {
          paymentUrl: vnpUrl,
          orderId: orderId,
          paymentId: payment.id,
        },
      });
    } catch (error) {
      console.error("=== VNPay Create Payment URL Error ===");
      console.error("Error:", error);
      console.error("Stack:", error.stack);

      res.status(500).json({
        success: false,
        message: "Tạo URL thanh toán thất bại",
        error: error.message,
      });
    }
  };

  // Xử lý kết quả trả về từ VNPAY (cập nhật để xử lý Order và Payment)
  vnpayReturn = async (req, res) => {
    try {
      console.log("=== VNPay Return Started ===");
      console.log("Query params:", JSON.stringify(req.query, null, 2));

      // Validate cấu hình
      let config;
      try {
        config = this.validateConfig();
      } catch (configError) {
        console.error("=== VNPay Config Error ===");
        console.error("Config Error:", configError.message);
        return res.redirect(
          `https://localhost:3000/payment-result?status=error&message=config_error`
        );
      }

      let vnp_Params = req.query;
      let secureHash = vnp_Params["vnp_SecureHash"];

      if (!secureHash) {
        console.error("Missing secure hash in return URL");
        return res.redirect(
          `https://localhost:3000/payment-result?status=error&message=missing_hash`
        );
      }

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", config.secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      let orderId = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      let amount = vnp_Params["vnp_Amount"];
      let transactionStatus = vnp_Params["vnp_TransactionStatus"];
      let transactionNo = vnp_Params["vnp_TransactionNo"];

      console.log("Payment Result:");
      console.log("- Order ID:", orderId);
      console.log("- Response Code:", rspCode);
      console.log("- Amount:", amount);
      console.log("- Transaction Status:", transactionStatus);
      console.log("- Transaction No:", transactionNo);

      if (secureHash === signed) {
        // Tìm order và payment
        const order = await Order.findOne({ idOrder: orderId });
        const payment = await Payment.findOne({ orderId: orderId });

        if (!order || !payment) {
          console.error("Order or Payment not found:", { orderId });
          return res.redirect(
            `https://localhost:3000/payment-result?status=error&message=order_not_found&orderId=${orderId}`
          );
        }

        // Kiểm tra amount có khớp không
        const expectedAmount = payment.amount * 100; // VNPay trả về amount * 100
        if (parseInt(amount) !== expectedAmount) {
          console.error("Amount mismatch:", {
            received: amount,
            expected: expectedAmount,
          });
          return res.redirect(
            `https://localhost:3000/payment-result?status=error&message=amount_mismatch&orderId=${orderId}`
          );
        }

        if (rspCode === "00" && transactionStatus === "00") {
          console.log("✅ Payment successful - updating database");

          // Cập nhật payment thành công
          payment.status = "completed";
          payment.paymentDate = new Date();
          await payment.save();

          // Order vẫn giữ nguyên status (pending)
          console.log("Payment updated to completed, Order remains pending");

          const redirectUrl =
            `https://localhost:3000/payment-result?` +
            `status=success&` +
            `orderId=${orderId}&` +
            `amount=${amount / 100}&` +
            `transactionId=${transactionNo}&` +
            `message=payment_success`;

          return res.redirect(redirectUrl);
        } else {
          console.log("❌ Payment failed - updating database");

          // Cập nhật payment thất bại
          payment.status = "failed";
          await payment.save();

          // Cập nhật order thành canceled
          order.status = "canceled";
          await order.save();

          console.log("Payment updated to failed, Order updated to canceled");

          const redirectUrl =
            `https://localhost:3000/payment-result?` +
            `status=failed&` +
            `orderId=${orderId}&` +
            `resultCode=${rspCode}&` +
            `message=payment_failed`;

          return res.redirect(redirectUrl);
        }
      } else {
        console.error("=== VNPay Return Hash Verification Failed ===");

        // Hash verification failed - cập nhật payment và order
        const payment = await Payment.findOne({ orderId: orderId });
        const order = await Order.findOne({ idOrder: orderId });

        if (payment) {
          payment.status = "failed";
          await payment.save();
        }

        if (order) {
          order.status = "canceled";
          await order.save();
        }

        return res.redirect(
          `https://localhost:3000/payment-result?status=error&message=invalid_hash&orderId=${orderId}`
        );
      }
    } catch (error) {
      console.error("=== VNPay Return Error ===");
      console.error("Error:", error);

      return res.redirect(
        `http://localhost:3000/payment-result?status=error&message=system_error`
      );
    }
  };

  // IPN từ VNPAY (cập nhật để xử lý Order và Payment)
  vnpayIPN = async (req, res) => {
    try {
      console.log("=== VNPay IPN Started ===");
      console.log("IPN Query params:", JSON.stringify(req.query, null, 2));

      let config;
      try {
        config = this.validateConfig();
      } catch (configError) {
        console.error("=== VNPay Config Error ===");
        return res.status(200).json({ RspCode: "99", Message: "Config error" });
      }

      let vnp_Params = req.query;
      let secureHash = vnp_Params["vnp_SecureHash"];
      let orderId = vnp_Params["vnp_TxnRef"];
      let rspCode = vnp_Params["vnp_ResponseCode"];
      let amount = vnp_Params["vnp_Amount"];
      let transactionNo = vnp_Params["vnp_TransactionNo"];

      if (!secureHash) {
        return res
          .status(200)
          .json({ RspCode: "97", Message: "Missing checksum" });
      }

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", config.secretKey);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        // Tìm order và payment
        const order = await Order.findOne({ idOrder: orderId });
        const payment = await Payment.findOne({ orderId: orderId });

        if (!order || !payment) {
          console.log("✗ Order or Payment not found");
          return res
            .status(200)
            .json({ RspCode: "01", Message: "Order not found" });
        }

        // Kiểm tra amount
        const expectedAmount = payment.amount * 100;
        if (parseInt(amount) !== expectedAmount) {
          console.log("✗ Amount validation failed");
          return res
            .status(200)
            .json({ RspCode: "04", Message: "Amount invalid" });
        }

        // Kiểm tra payment đã được xử lý chưa
        if (payment.status !== "pending") {
          console.log("✗ Payment already processed");
          return res.status(200).json({
            RspCode: "02",
            Message: "This order has been updated to the payment status",
          });
        }

        if (rspCode == "00") {
          console.log("✓ IPN Payment successful - updating database");

          // Cập nhật payment thành công
          payment.status = "completed";
          payment.paymentDate = new Date();
          await payment.save();

          // Order vẫn giữ nguyên status
          console.log(
            "IPN: Payment updated to completed, Order remains pending"
          );

          return res.status(200).json({ RspCode: "00", Message: "Success" });
        } else {
          console.log("✗ IPN Payment failed - updating database");

          // Cập nhật payment thất bại
          payment.status = "failed";
          await payment.save();

          // Cập nhật order thành canceled
          order.status = "canceled";
          await order.save();

          console.log(
            "IPN: Payment updated to failed, Order updated to canceled"
          );

          return res.status(200).json({ RspCode: "00", Message: "Success" });
        }
      } else {
        console.log("✗ Hash validation failed");
        return res
          .status(200)
          .json({ RspCode: "97", Message: "Checksum failed" });
      }
    } catch (error) {
      console.error("=== VNPay IPN Error ===");
      console.error("Error:", error);

      return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  };

  // Truy vấn giao dịch
  queryTransaction = (req, res) => {
    try {
      console.log("=== VNPay Query Transaction Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // Validate cấu hình
      let config;
      try {
        config = this.validateConfig();
      } catch (configError) {
        console.error("=== VNPay Config Error ===");
        console.error("Config Error:", configError.message);
        return res.status(500).json({
          success: false,
          message: "Cấu hình VNPay không đầy đủ",
          error: configError.message,
        });
      }

      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();

      let vnp_TxnRef = req.body.orderId;
      let vnp_TransactionDate = req.body.transDate;

      if (!vnp_TxnRef || !vnp_TransactionDate) {
        return res.status(400).json({
          success: false,
          message: "Thiếu orderId hoặc transDate",
        });
      }

      console.log("Query Config:");
      console.log("- API URL:", config.apiUrl);
      console.log(
        "- TMN Code:",
        config.tmnCode ? "***" + config.tmnCode.slice(-4) : "NOT SET"
      );
      console.log("- Order ID:", vnp_TxnRef);
      console.log("- Transaction Date:", vnp_TransactionDate);

      let vnp_RequestId = moment(date).format("HHmmss");
      let vnp_Version = "2.1.0";
      let vnp_Command = "querydr";
      let vnp_OrderInfo = "Truy van GD ma:" + vnp_TxnRef;

      let vnp_IpAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

      let data =
        vnp_RequestId +
        "|" +
        vnp_Version +
        "|" +
        vnp_Command +
        "|" +
        config.tmnCode +
        "|" +
        vnp_TxnRef +
        "|" +
        vnp_TransactionDate +
        "|" +
        vnp_CreateDate +
        "|" +
        vnp_IpAddr +
        "|" +
        vnp_OrderInfo;

      console.log("Query Sign Data:", data);

      let hmac = crypto.createHmac("sha512", config.secretKey);
      let vnp_SecureHash = hmac
        .update(Buffer.from(data, "utf-8"))
        .digest("hex");

      console.log("Query Secure Hash:", vnp_SecureHash);

      let dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: config.tmnCode,
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
      };

      console.log("Query Request Object:", JSON.stringify(dataObj, null, 2));

      request(
        {
          url: config.apiUrl,
          method: "POST",
          json: true,
          body: dataObj,
        },
        function (error, response, body) {
          if (error) {
            console.error("=== VNPay Query Transaction Error ===");
            console.error("Request Error:", error);

            return res.status(500).json({
              success: false,
              message: "Truy vấn giao dịch thất bại",
              error: error.message,
            });
          }

          console.log("Query Response Status:", response?.statusCode);
          console.log("Query Response Body:", JSON.stringify(body, null, 2));
          console.log("=== VNPay Query Transaction Completed ===");

          res.status(200).json({
            success: true,
            data: body,
          });
        }
      );
    } catch (error) {
      console.error("=== VNPay Query Transaction Error ===");
      console.error("Error:", error);
      console.error("Stack:", error.stack);

      res.status(500).json({
        success: false,
        message: "Truy vấn giao dịch thất bại",
        error: error.message,
      });
    }
  };

  // Hoàn tiền
  refund = (req, res) => {
    try {
      console.log("=== VNPay Refund Started ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // Validate cấu hình
      let config;
      try {
        config = this.validateConfig();
      } catch (configError) {
        console.error("=== VNPay Config Error ===");
        console.error("Config Error:", configError.message);
        return res.status(500).json({
          success: false,
          message: "Cấu hình VNPay không đầy đủ",
          error: configError.message,
        });
      }

      process.env.TZ = "Asia/Ho_Chi_Minh";
      let date = new Date();

      let vnp_TxnRef = req.body.orderId;
      let vnp_TransactionDate = req.body.transDate;
      let vnp_Amount = req.body.amount * 100;
      let vnp_TransactionType = req.body.transType;
      let vnp_CreateBy = req.body.user;

      if (
        !vnp_TxnRef ||
        !vnp_TransactionDate ||
        !req.body.amount ||
        !vnp_TransactionType ||
        !vnp_CreateBy
      ) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc cho hoàn tiền",
        });
      }

      console.log("Refund Details:");
      console.log("- Order ID:", vnp_TxnRef);
      console.log("- Transaction Date:", vnp_TransactionDate);
      console.log("- Amount:", vnp_Amount);
      console.log("- Transaction Type:", vnp_TransactionType);
      console.log("- Created By:", vnp_CreateBy);

      let vnp_RequestId = moment(date).format("HHmmss");
      let vnp_Version = "2.1.0";
      let vnp_Command = "refund";
      let vnp_OrderInfo = "Hoan tien GD ma:" + vnp_TxnRef;

      let vnp_IpAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");
      let vnp_TransactionNo = "0";

      let data =
        vnp_RequestId +
        "|" +
        vnp_Version +
        "|" +
        vnp_Command +
        "|" +
        config.tmnCode +
        "|" +
        vnp_TransactionType +
        "|" +
        vnp_TxnRef +
        "|" +
        vnp_Amount +
        "|" +
        vnp_TransactionNo +
        "|" +
        vnp_TransactionDate +
        "|" +
        vnp_CreateBy +
        "|" +
        vnp_CreateDate +
        "|" +
        vnp_IpAddr +
        "|" +
        vnp_OrderInfo;

      console.log("Refund Sign Data:", data);

      let hmac = crypto.createHmac("sha512", config.secretKey);
      let vnp_SecureHash = hmac
        .update(Buffer.from(data, "utf-8"))
        .digest("hex");

      console.log("Refund Secure Hash:", vnp_SecureHash);

      let dataObj = {
        vnp_RequestId: vnp_RequestId,
        vnp_Version: vnp_Version,
        vnp_Command: vnp_Command,
        vnp_TmnCode: config.tmnCode,
        vnp_TransactionType: vnp_TransactionType,
        vnp_TxnRef: vnp_TxnRef,
        vnp_Amount: vnp_Amount,
        vnp_TransactionNo: vnp_TransactionNo,
        vnp_CreateBy: vnp_CreateBy,
        vnp_OrderInfo: vnp_OrderInfo,
        vnp_TransactionDate: vnp_TransactionDate,
        vnp_CreateDate: vnp_CreateDate,
        vnp_IpAddr: vnp_IpAddr,
        vnp_SecureHash: vnp_SecureHash,
      };

      console.log("Refund Request Object:", JSON.stringify(dataObj, null, 2));

      request(
        {
          url: config.apiUrl,
          method: "POST",
          json: true,
          body: dataObj,
        },
        function (error, response, body) {
          if (error) {
            console.error("=== VNPay Refund Error ===");
            console.error("Request Error:", error);

            return res.status(500).json({
              success: false,
              message: "Hoàn tiền thất bại",
              error: error.message,
            });
          }

          console.log("Refund Response Status:", response?.statusCode);
          console.log("Refund Response Body:", JSON.stringify(body, null, 2));
          console.log("=== VNPay Refund Completed ===");

          res.status(200).json({
            success: true,
            data: body,
          });
        }
      );
    } catch (error) {
      console.error("=== VNPay Refund Error ===");
      console.error("Error:", error);
      console.error("Stack:", error.stack);

      res.status(500).json({
        success: false,
        message: "Hoàn tiền thất bại",
        error: error.message,
      });
    }
  };

  // Helper function để sắp xếp object

  sortObject(obj) {
    // Chuyển đổi object thành plain object trước
    const plainObj = { ...obj };

    let sorted = {};
    let str = [];

    for (let key in plainObj) {
      str.push(encodeURIComponent(key));
    }

    str.sort();

    for (let i = 0; i < str.length; i++) {
      const decodedKey = decodeURIComponent(str[i]);
      sorted[str[i]] = encodeURIComponent(plainObj[decodedKey]).replace(
        /%20/g,
        "+"
      );
    }

    return sorted;
  }
}

module.exports = new VNPayController();
