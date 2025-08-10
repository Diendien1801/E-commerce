const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const { paypalClient, paypalSdk } = require('../config/paypal');
const { createPayPalOrder } = require('../services/paypal');
const { v4: uuidv4 } = require('uuid');

const SUPPORTED_CURRENCIES = ['USD'];


exports.createPayment = async (req, res) => {
  try {
    const { orderId, userId, amount, method, currency } = req.body;

    if (!orderId || !userId || !amount || !method) {
      return res.status(400).json({ success: false, message: 'Missing required fields', data: null });
    }

    const payCurrency = currency && SUPPORTED_CURRENCIES.includes(currency)
      ? currency
      : 'USD';

    const payment = await Payment.create({
      id: uuidv4(),
      userId,
      orderId,
      method,
      amount,
      currency: payCurrency,
      status: 'pending'
    });

    if (method === 'PayPal') {
      try {
        const approveUrl = await createPayPalOrder(payment);

        const urlObj = new URL(approveUrl);
        const orderID = urlObj.searchParams.get("token");

        return res.status(200).json({
          success: true,
          data: {
            paymentId: payment.id,
            orderID,
            approveUrl,
            currency: payCurrency
          }
        });
      } catch (paypalErr) {
        console.error('PayPal error:', paypalErr);
        return res.status(500).json({ success: false, message: 'Failed to create PayPal order', data: null });
      }
    }

    // TODO: Handle MoMo or other payment methods here

  } catch (err) {
    console.error('createPayment error:', err);
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

// Retry payment for failed or pending payments
exports.retryPayPalPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findOne({ id: paymentId });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    if (payment.method === 'PayPal') {
      const approveUrl = await createPayPalOrder(payment);
      return res.status(200).json({ success: true, message: 'Retry initiated', data: { approveUrl }});
    }

    // Handle other payment methods (MoMo, Cash on Delivery) 
    //....

    return res.status(400).json({ success: false, message: 'Unsupported payment method for retry' });

  } catch (err) {
    console.error('retryPayment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel expired payments (to be run by cron job)
exports.cancelExpiredPayments = async () => {
  const expiryDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const expired = await Payment.find({ status: 'pending', createdAt: { $lt: expiryDate } });
  for (const pay of expired) {
    pay.status = 'canceled';
    await pay.save();
    await Order.findOneAndUpdate({ idOrder: pay.orderId }, { status: 'canceled' });
  }
};

//PAYPAL PAYMENT HANDLING
// Handle PayPal payment approval
exports.capturePayPalPayment = async (req, res) => {
  try {
    const { orderID, paymentId } = req.body; // orderID is the PayPal order ID
    if (!orderID || !paymentId) {
      return res.status(400).json({ success: false, message: 'Missing orderID or paymentId', data: null });
    }

    const request = new paypalSdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    if (capture.statusCode !== 201) {
      await Payment.findOneAndUpdate({ id: paymentId }, { status: 'failed' });
      return res.status(400).json({ success: false, message: 'Payment capture failed', data: null });
    }

    const captureId = capture.result.purchase_units[0].payments.captures[0].id; // Capture ID from PayPal response

    await Payment.findOneAndUpdate(
      { id: paymentId },
      {
        status: 'completed',
        paymentDate: new Date(),
        transactionId: captureId
      }
    );

    await Order.findOneAndUpdate(
      { idOrder: capture.result.purchase_units[0].reference_id },
      { status: 'picking' }
    );

    return res.status(200).json({ success: true, message: 'Payment completed', data: capture.result });

  } catch (err) {
    console.error('capturePayment error:', err);
    await Payment.findOneAndUpdate({ id: req.body.paymentId }, { status: 'failed' });
    return res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};


