const Order = require("../models/order.model");
const User = require("../models/user.model");

// Helper: get user role by ID
async function getUserRole(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user.role;
}


// Return all orders with pagination 
exports.getAllOrders = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Filter parameters
    const { status, startDate, endDate, userId } = req.query;

    const filter = {};

    // Filter by specific user if provided
    if (userId) {
      filter.idUser = userId;
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Count total documents
    const total = await Order.countDocuments(filter);

    // Find orders with pagination
    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: total,
          ordersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
        },
      },
    });
  } catch (err) {
    console.error("getAllOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// Return orders by status with pagination 
exports.getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
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
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}.`,
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = { status };

    // Count total documents
    const total = await Order.countDocuments(filter);
    
    // Find orders with pagination
    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No orders found with status "${status}".`,
        data: {
          orders: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalOrders: 0,
            ordersPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders with status "${status}" retrieved successfully`,
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: total,
          ordersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        }
      }
    });
    
  } catch (err) {
    console.error("getOrdersByStatus error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      data: null 
    });
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




// Get orders by user ID with pagination
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Filter parameters
    const { status, startDate, endDate } = req.query;
    
    const filter = { idUser: userId };
    
    // Status filtering
    if (status) {
      filter.status = status;
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Count total documents
    const total = await Order.countDocuments(filter);
    
    // Find orders with pagination
    const orders = await Order.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: orders,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalOrders: total,
          ordersPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        }
      }
    });
    
  } catch (error) {
    console.error("getOrdersByUserId error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null
    });
  }
};


// API: Get orders by user ID with status filter
exports.getOrdersByUserIdWithFilter = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
        data: null
      });
    }

    // Build filter
    const filter = { idUser: userId };

    // Add status filter if provided
    if (status) {
      const validStatuses = ['pending', 'picking', 'shipping', 'delivered', 'completed', 'returned', 'canceled'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`,
          data: null
        });
      }
      
      filter.status = status;
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sort


    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Execute queries
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber),
      Order.countDocuments(filter)
    ]);

    // Get status statistics for this user
    const statusStats = await Order.aggregate([
      { $match: { idUser: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Format statistics
    const statistics = {};
    statusStats.forEach(stat => {
      statistics[stat._id] = stat.count;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,


      message: status 
        ? `Found ${total} ${status} order(s) for user ${userId}`
        : `Found ${total} order(s) for user ${userId}`,

      data: {
        orders: orders,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalOrders: total,
          ordersPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,

          hasPrevPage: pageNumber > 1
        },
        filters: {
          userId: userId,
          status: status || 'all',
          sortBy: sortBy,
          sortOrder: sortOrder
        },
        statistics: statistics
      }
    });

  } catch (error) {
    console.error("getOrdersByUserIdWithFilter error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrieving orders",
      data: null

    });
  }
};

// Search orders by order ID với partial matching
exports.searchOrdersByOrderId = async (req, res) => {
};

exports.getTotalOrders = async (req, res) => {
  try {
    const total = await Order.countDocuments({});
    return res.json({ success: true, total });
  } catch (err) {
    console.error('getTotalOrders error', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get a specific order by userId and orderId
exports.getOrderByUserAndOrderId = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    // Validate parameters
    if (!userId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId or orderId",
        data: null
      });
    }

    // Find a single order by userId and orderId
    const order = await Order.findOne({
      idUser: userId,
      _id: orderId
    });

    // If no order is found
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order
    });
  } catch (error) {
    // Internal server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Utility: escape string to safely use inside RegExp
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

//Search orders for a specific user by substring match on idOrder.
exports.searchOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const q = (req.query.q || '').trim();

    // Pagination
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId in params.' });
    }
    if (!q) {
      return res.status(400).json({ success: false, message: 'Missing search query parameter "q".' });
    }

    // Optional: limit length of q to avoid abuse
    if (q.length > 100) {
      return res.status(400).json({ success: false, message: 'Search query too long. Max length is 100 characters.' });
    }

    // Escape query to avoid regex injection / special char issues
    const safeQ = escapeRegExp(q);

    // Create case-insensitive regex for substring match
    const regex = new RegExp(safeQ, 'i');

    // Query: match idUser and idOrder contains `q`
    const filter = {
      idUser: userId,
      idOrder: { $regex: regex }
    };

    // Total count for pagination metadata
    const total = await Order.countDocuments(filter);

    // Fetch documents with pagination; sort by newest first
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return res.status(200).json({
      success: true,
      data: orders,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('searchOrdersByUser error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};