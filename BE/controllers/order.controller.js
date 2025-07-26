const Order = require('../models/order.model');

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
  const validStatuses = ['pending', 'picking', 'shipping', 'completed', 'returned', 'canceled'];

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
