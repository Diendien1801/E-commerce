const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

const env =
  process.env.NODE_ENV === "production"
    ? new checkoutNodeJssdk.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new checkoutNodeJssdk.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

const client = new checkoutNodeJssdk.core.PayPalHttpClient(env);

module.exports = {
  paypalClient: client,
  paypalSdk: checkoutNodeJssdk,
};

