const { paypalClient, paypalSdk } = require("../config/paypal");

exports.createPayPalOrder = async (payment) => {
  const request = new paypalSdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");

  const orderId = payment.orderId; // Lấy orderId từ payment

  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: payment.id,
        amount: {
          currency_code: payment.currency,
          value: payment.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      return_url: `https://localhost:3000/payment-result?status=success&orderId=${orderId}`,
      cancel_url: `https://localhost:3000/payment-result?status=failed&orderId=${orderId}`,
    },
  });

  const response = await paypalClient.execute(request);

  if (response.statusCode !== 201) {
    throw new Error("PayPal order creation failed");
  }

  const approveLink = response.result.links.find((l) => l.rel === "approve");
  if (!approveLink) {
    throw new Error("Approve URL not found in PayPal response");
  }

  return approveLink.href;
};
