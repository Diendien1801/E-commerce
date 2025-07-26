const Order = require('../models/order.model');

// ORDER MANAGEMENT CONTROLLER
// Return all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error('getAllOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Return orders by status
exports.getOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  const validStatuses = ['pending', 'picking', 'shipping', 'delivered', 'completed', 'returned', 'canceled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({success: false, message: `Invalid status. Allowed values: ${validStatuses.join(', ')}.`});
  }

  try {
    const orders = await Order.find({ status });

    if (orders.length === 0) {
      return res.status(200).json({success: true, message: `No orders found with status "${status}".`, data: []});
    }

    return res.status(200).json({ success: true, data: orders });

  } catch (err) {
    console.error('getOrdersByStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single order by its idOrder
exports.getOrderById = async (req, res) => {
  try {
    const { idOr } = req.params;
    const order = await Order.findOne({ idOrder: idOr });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', data: null });
    }
    return res.status(200).json({ success: true, message: 'Order retrieved successfully', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

// Get paginated orders
exports.getOrdersPaginated = async (req, res) => {
  try {
    // Parse page & limit from query string (defaults: page=1, limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Total number of orders
    const total = await Order.countDocuments();
    // Fetch paginated orders
    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // latest first

    return res.status(200).json({success: true, message: 'Orders retrieved successfully', data: {page, limit, total, orders},});
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      idOrder,
      idUser,
      items,
      status,
      paymentMethod,
      shippingAddress
    } = req.body;

    if (!idOrder || !idUser || !items || !paymentMethod || !shippingAddress) { // check for required fields
      return res.status(400).json({ status: 'error', message: 'Missing required fields', data: null });
    }

    const order = new Order({ idOrder, idUser, items, status, paymentMethod, shippingAddress }); // create order object
    await order.save(); // save to database

    return res.status(201).json({ status: 'success', message: 'Order created successfully', data: order });
  } catch (err) {
    console.error('Error creating order:', err); // log error
    return res.status(500).json({ status: 'error', message: err.name === 'ValidationError' ? err.message : 'Internal server error', data: null });
  }
};
