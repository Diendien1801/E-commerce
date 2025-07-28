const Order = require("../models/order.model");
const User = require("../models/user.model");

// Helper: get user role by ID
async function getUserRole(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user.role;
}

// Return all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const role = await getUserRole(userId);
    const filter = {};

    if (role === "user") {
      filter.idUser = userId;
    }

    const orders = await Order.find(filter);
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    const statusCode = err.message === "User not found" ? 404 : 500;
    const msg =
      err.message === "User not found" ? "User not found" : "Server error";
    return res.status(statusCode).json({ success: false, message: msg });
  }
};

// Return orders by status
exports.getOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  const { userId } = req.body;
  const validStatuses = [
    "pending",
    "picking",
    "shipping",
    "delivered",
    "completed",
    "returned",
    "canceled",
  ];

  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}.`,
      });
  }

  try {
    const role = await getUserRole(userId);
    const filter = { status };

    if (role === "user") {
      filter.idUser = userId;
    }

    const orders = await Order.find(filter);
    if (orders.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: `No orders found with status "${status}" for this user.`,
          data: [],
        });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getOrdersByStatus error:", err);
    const statusCode = err.message === "User not found" ? 404 : 500;
    const msg =
      err.message === "User not found" ? "User not found" : "Server error";
    return res.status(statusCode).json({ success: false, message: msg });
  }
};

// Get a single order by its idOrder
exports.getOrderById = async (req, res) => {
  try {
    const { userId } = req.body;
    const role = await getUserRole(userId);
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });
    }

    if (role === "user" && order.idUser !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied", data: null });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Order retrieved successfully",
        data: order,
      });
  } catch (err) {
    console.error("getOrderById error:", err);
    const statusCode = err.message === "User not found" ? 404 : 500;
    const msg =
      err.message === "User not found" ? "User not found" : "Server error";
    return res
      .status(statusCode)
      .json({ success: false, message: msg, data: null });
  }
};

// Get paginated orders
exports.getOrdersPaginated = async (req, res) => {
  try {
    const { userId } = req.body;
    const role = await getUserRole(userId);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role === "user") {
      filter.idUser = userId;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: { page, limit, total, orders },
    });
  } catch (err) {
    console.error("getOrdersPaginated error:", err);
    const statusCode = err.message === "User not found" ? 404 : 500;
    const msg =
      err.message === "User not found" ? "User not found" : "Server error";
    return res
      .status(statusCode)
      .json({ success: false, message: msg, data: null });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { idOrder, idUser, items, status, paymentMethod, shippingAddress } =
      req.body;

    if (!idOrder || !idUser || !items || !paymentMethod || !shippingAddress) {
      // check for required fields
      return res
        .status(400)
        .json({
          status: "error",
          message: "Missing required fields",
          data: null,
        });
    }

    const order = new Order({
      idOrder,
      idUser,
      items,
      status,
      paymentMethod,
      shippingAddress,
    }); // create order object
    await order.save(); // save to database

    return res
      .status(201)
      .json({
        status: "success",
        message: "Order created successfully",
        data: order,
      });
  } catch (err) {
    console.error("Error creating order:", err); // log error
    return res
      .status(500)
      .json({
        status: "error",
        message:
          err.name === "ValidationError"
            ? err.message
            : "Internal server error",
        data: null,
      });
  }
};

// STATUS TRANSITIONS
// Approve order: pending -> picking
exports.approveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot approve order when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "picking";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order approved successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Cancel order: pending or picking -> canceled
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (!["pending", "picking"].includes(order.status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot cancel order when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "canceled";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order canceled successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Ship order: picking -> shipping
exports.shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (order.status !== "picking") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot ship order when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "shipping";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order shipped successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Deliver order: shipping -> delivered
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (order.status !== "shipping") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot confirm delivery when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "delivered";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order delivered successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Return order: shipping or delivered -> returned
exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (!["shipping", "delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot return order when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "returned";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order returned successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};

// Complete order: delivered -> completed
exports.completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found", data: null });

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({
          success: false,
          message: `Cannot complete order when status is: ${order.status}`,
          data: null,
        });
    }
    order.status = "completed";
    await order.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Order completed successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", data: null });
  }
};



// Get orders by user ID
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Tìm orders theo userId
    const orders = await Order.find({ idUser: userId })
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
    
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};