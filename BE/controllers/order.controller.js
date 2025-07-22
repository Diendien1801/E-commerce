const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const mongoose = require("mongoose"); // Thêm import này

// Helper function để tìm sản phẩm
const findProductByAnyId = async (productId) => {
  // Kiểm tra nếu là ObjectId hợp lệ
  if (mongoose.Types.ObjectId.isValid(productId) && productId.length === 24) {
    const product = await Product.findById(productId).select(
      "title imageUrl price status categoryName"
    );
    if (product) return product;
  }

  // Nếu không phải ObjectId, tìm theo các field khác
  return await Product.findOne({
    $or: [{ title: productId }, { productCode: productId }, { sku: productId }],
  }).select("title imageUrl price status categoryName");
};

// Return all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Return orders by status
exports.getOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  // validate status
  const validStatuses = ["pending", "complete", "canceled"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}.`,
      });
  }

  try {
    const orders = await Order.find({ status });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getOrdersByStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// API: Get orders by user ID with payment info
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy orders của user
    const orders = await Order.find({ idUser: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          orders: [],
        },
      });
    }

    // Lấy payment info cho từng order
    const ordersWithPayment = await Promise.all(
      orders.map(async (order) => {
        // Tìm payment theo orderId
        const payment = await Payment.findOne({ orderId: order.idOrder });

        // Lấy thông tin chi tiết sản phẩm - SỬA PHẦN NÀY
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const product = await findProductByAnyId(item.productID); // Dùng helper function
            return {
              ...item.toObject(),
              productDetails: product,
            };
          })
        );

        return {
          ...order.toObject(),
          items: itemsWithDetails,
          paymentInfo: payment
            ? {
                paymentId: payment.id, // Sửa từ paymentId thành id
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                transactionId: payment.transactionId,
                paidAt: payment.paidAt,
                createdAt: payment.createdAt,
              }
            : null,
        };
      })
    );

    const total = await Order.countDocuments({ idUser: userId });

    res.status(200).json({
      success: true,
      data: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        userId,
        orders: ordersWithPayment,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy đơn hàng theo user",
      detail: err.toString(),
    });
  }
};

// API: Get order detail by order ID with full info
exports.getOrderDetailById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Lấy order
    const order = await Order.findOne({ idOrder: orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy đơn hàng",
      });
    }

    // Lấy user info - SỬA PHẦN NÀY
    let user = null;
    if (
      mongoose.Types.ObjectId.isValid(order.idUser) &&
      order.idUser.length === 24
    ) {
      user = await User.findById(order.idUser).select("name email avatar");
    } else {
      // Tìm user theo field khác nếu idUser không phải ObjectId
      user = await User.findOne({
        $or: [{ userId: order.idUser }, { email: order.idUser }],
      }).select("name email avatar");
    }

    // Lấy payment info
    const payment = await Payment.findOne({ orderId: orderId });

    // Lấy chi tiết sản phẩm - SỬA PHẦN NÀY
    const itemsWithDetails = await Promise.all(
      order.items.map(async (item) => {
        const product = await findProductByAnyId(item.productID); // Dùng helper function
        return {
          ...item.toObject(),
          productDetails: product,
        };
      })
    );

    // Tính tổng tiền
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = subtotal > 500000 ? 0 : 30000; // Free ship từ 500k
    const total = subtotal + shippingFee;

    res.status(200).json({
      success: true,
      data: {
        order: {
          ...order.toObject(),
          items: itemsWithDetails,
        },
        userInfo: user,
        paymentInfo: payment,
        summary: {
          subtotal,
          shippingFee,
          total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy chi tiết đơn hàng",
      detail: err.toString(),
    });
  }
};

// API: Get orders with filters
exports.getOrdersWithFilters = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      status,
      paymentStatus,
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    let filter = { idUser: userId };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Lấy orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lấy payments và filter theo status nếu có
    let ordersWithPayment = await Promise.all(
      orders.map(async (order) => {
        const payment = await Payment.findOne({ orderId: order.idOrder });
        return {
          ...order.toObject(),
          paymentInfo: payment,
        };
      })
    );

    // Filter theo payment status nếu có
    if (paymentStatus) {
      ordersWithPayment = ordersWithPayment.filter(
        (order) =>
          order.paymentInfo && order.paymentInfo.status === paymentStatus
      );
    }

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        filters: { status, paymentStatus, startDate, endDate },
        orders: ordersWithPayment,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy đơn hàng với bộ lọc",
      detail: err.toString(),
    });
  }
};