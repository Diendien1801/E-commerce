const { paypalClient, paypalSdk } = require('../config/paypal');

exports.createPayPalOrder = async (payment) => {
  const request = new paypalSdk.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: payment.id,
        amount: {
          currency_code: payment.currency,
          value: payment.amount.toFixed(2)
        }
      }
    ]
  });

  const response = await paypalClient.execute(request);

  if (response.statusCode !== 201) {
    throw new Error('PayPal order creation failed');
  }

  const approveLink = response.result.links.find((l) => l.rel === 'approve');
  if (!approveLink) {
    throw new Error('Approve URL not found in PayPal response');
  }

  return approveLink.href;
};