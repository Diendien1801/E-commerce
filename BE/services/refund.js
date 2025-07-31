const { paypalClient, paypalSdk } = require('../config/paypal');
const Refund = require('../models/refund.model');
const { v4: uuidv4 } = require('uuid');

exports.processPayPalRefund = async (payment) => {
  const currency = payment.currency || 'USD';
  const refundId = uuidv4();

  const request = new paypalSdk.payments.CapturesRefundRequest(payment.transactionId);
  request.requestBody({
    amount: {
      currency_code: currency,
      value: payment.amount.toFixed(2)
    }
  });

  try {
    const refundResponse = await paypalClient.execute(request);

    if (refundResponse.statusCode === 201) {
      // Refund successful
      payment.status = 'refunded';
      payment.hasRefund = true;
      await payment.save();

      // Create refund record
      await Refund.create({
        refundId,
        paymentId: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        method: payment.method,
        refundGatewayId: refundResponse.result.id,
        status: 'success'
      });

      return refundResponse.result;
    }

    // Refund failed
    await Refund.create({
      refundId,
      paymentId: payment.id,
      userId: payment.userId,
      amount: payment.amount,
      method: payment.method,
      status: 'failed',
      reason: 'PayPal response code != 201'
    });

    throw new Error('Refund failed with statusCode ' + refundResponse.statusCode);
  } catch (err) {
    // Log error and create refund record
    await Refund.create({
      refundId,
      paymentId: payment.id,
      userId: payment.userId,
      amount: payment.amount,
      method: payment.method,
      status: 'failed',
      reason: err.message || 'Unknown error during refund'
    });

    throw err;
  }
};
