const Payment = require("../models/payment.model");
const Order = require("../models/order.model");
const { paypalClient, paypalSdk } = require("../config/paypal");
const { createPayPalOrder } = require("../services/paypal");
const { v4: uuidv4 } = require("uuid");
const { URL } = require("url");

const EXCHANGE_RATE_VND_TO_USD = 0.000038; // 1 VND = 0.000038 USD

exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment cho order này",
      });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
};
exports.createPayment = async (req, res) => {
  try {
    // Không lấy amount từ body nữa
    const { orderId, method, amount } = req.body;

    // Kiểm tra trường bắt buộc
    if (!orderId || !method) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId or method",
        data: null,
      });
    }

    // Tìm order: ưu tiên tìm theo idOrder, nếu không có thử tìm theo _id
    let order = await Order.findOne({ idOrder: orderId });
    if (!order) {
      // nếu orderId có thể là ObjectId thì thử tìm bằng _id
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }
    }

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });
    }

    // Tính tổng tiền từ thông tin order (price * quantity)
    const totalVND = amount;

    if (totalVND <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated order amount is invalid (<= 0)",
        data: null,
      });
    }

    // Lấy userId từ order để tránh mismatch (ghi đè userId gửi từ client nếu có)
    const userId = order.idUser;

    // Tạo payment trong DB với amount tính được (đơn vị VND)
    const payment = await Payment.create({
      id: uuidv4(),
      userId,
      orderId, // giữ nguyên giá trị orderId client truyền (có thể là idOrder hoặc _id)
      method,
      amount: totalVND,
      currency: "VND",
      status: "completed",
    });

    console.log("Payment created:", payment);
    // Nếu thanh toán bằng PayPal => chuyển sang USD để tạo PayPal order
    if (method === "paypal") {
      try {
        // EXCHANGE_RATE_VND_TO_USD phải được định nghĩa ở nơi khác (ví dụ: từ config / env)
        const rate =
          typeof EXCHANGE_RATE_VND_TO_USD !== "undefined"
            ? EXCHANGE_RATE_VND_TO_USD
            : parseFloat(process.env.EXCHANGE_RATE_VND_TO_USD || 0);
        if (!rate || Number(rate) <= 0) {
          console.warn(
            "Missing or invalid EXCHANGE_RATE_VND_TO_USD, PayPal conversion may fail."
          );
        }
        const amountUSD = Math.ceil(totalVND * (rate || 0) * 100) / 100; // làm tròn 2 chữ số
        const approveUrl = await createPayPalOrder({
          ...payment.toObject(),
          amount: amountUSD,
          currency: "USD",
        });

        const urlObj = new URL(approveUrl);
        const orderID = urlObj.searchParams.get("token");

        return res.status(200).json({
          success: true,
          data: {
            paymentId: payment.id,
            orderID,
            approveUrl,
            amountVND: totalVND,
            amountUSD,
          },
        });
      } catch (paypalErr) {
        console.error("PayPal error:", paypalErr);
        return res.status(500).json({
          success: false,
          message: "Failed to create PayPal order",
          data: null,
        });
      }
    }

    // Trả về kết quả cho các phương thức khác (VD: MoMo, COD)
    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        amountVND: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (err) {
    console.error("createPayment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Retry payment for failed or pending payments
exports.retryPayPalPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findOne({ id: paymentId });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "completed") {
      return res
        .status(400)
        .json({ success: false, message: "Payment already completed" });
    }

    if (payment.method === "PayPal") {
      // Convert VND to USD for PayPal
      const amountUSD =
        Math.ceil(payment.amount * EXCHANGE_RATE_VND_TO_USD * 100) / 100;

      const approveUrl = await createPayPalOrder({
        ...payment.toObject(),
        amount: amountUSD,
        currency: "USD",
      });

      const urlObj = new URL(approveUrl);
      const orderID = urlObj.searchParams.get("token");

      return res.status(200).json({
        success: true,
        message: "Retry initiated",
        data: {
          approveUrl,
          orderID,
          currency: "USD",
          amountUSD,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported payment method for retry",
    });
  } catch (err) {
    console.error("retryPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel expired payments (to be run by cron job)
exports.cancelExpiredPayments = async () => {
  const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expired = await Payment.find({
    status: "pending",
    createdAt: { $lt: expiryDate },
  });
  for (const pay of expired) {
    pay.status = "canceled";
    await pay.save();
    await Order.findOneAndUpdate(
      { idOrder: pay.orderId },
      { status: "canceled" }
    );
  }
};

//PAYPAL PAYMENT HANDLING
// Handle PayPal payment approval
exports.capturePayPalPayment = async (req, res) => {
  try {
    const { orderID, paymentId } = req.body; // orderID is the PayPal order ID
    if (!orderID || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Missing orderID or paymentId",
        data: null,
      });
    }

    const request = new paypalSdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    if (capture.statusCode !== 201) {
      await Payment.findOneAndUpdate({ id: paymentId }, { status: "failed" });
      return res.status(400).json({
        success: false,
        message: "Payment capture failed",
        data: null,
      });
    }

    const captureId = capture.result.purchase_units[0].payments.captures[0].id; // Capture ID from PayPal response

    await Payment.findOneAndUpdate(
      { id: paymentId },
      {
        status: "completed",
        paymentDate: new Date(),
        transactionId: captureId,
      }
    );

    await Order.findOneAndUpdate(
      { idOrder: capture.result.purchase_units[0].reference_id },
      { status: "picking" }
    );

    return res.status(200).json({
      success: true,
      message: "Payment completed",
      data: capture.result,
    });
  } catch (err) {
    console.error("capturePayment error:", err);
    await Payment.findOneAndUpdate(
      { id: req.body.paymentId },
      { status: "failed" }
    );
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};
