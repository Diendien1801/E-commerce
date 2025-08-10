const crypto = require("crypto");
const https = require("https");

exports.createPayment = (req, res) => {
  const {
    MOMO_PARTNER_CODE,
    MOMO_ACCESS_KEY,
    MOMO_SECRET_KEY,
    MOMO_REDIRECT_URL,
    MOMO_IPN_URL,
  } = process.env;

  const { amount, orderInfo } = req.body;

  // Sinh ID duy nhất
  const requestId = MOMO_PARTNER_CODE + new Date().getTime();
  const orderId = requestId;
  const requestType = "captureWallet";
  const extraData = "";

  // 1️⃣ Tạo raw signature
  const rawSignature =
    `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}` +
    `&ipnUrl=${MOMO_IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}` +
    `&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${MOMO_REDIRECT_URL}` +
    `&requestId=${requestId}&requestType=${requestType}`;

  console.log("-----RAW SIGNATURE-----");
  console.log(rawSignature);

  // 2️⃣ Ký SHA256
  const signature = crypto
    .createHmac("sha256", MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest("hex");

  console.log("-----SIGNATURE-----");
  console.log(signature);

  // 3️⃣ Tạo body gửi MoMo
  const requestBody = JSON.stringify({
    partnerCode: MOMO_PARTNER_CODE,
    accessKey: MOMO_ACCESS_KEY,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: MOMO_REDIRECT_URL,
    ipnUrl: MOMO_IPN_URL,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });

  // 4️⃣ Gửi HTTPS request
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };

  const momoReq = https.request(options, (momoRes) => {
    momoRes.setEncoding("utf8");
    let data = "";
    momoRes.on("data", (chunk) => (data += chunk));
    momoRes.on("end", () => {
      const json = JSON.parse(data);
      console.log("MoMo Response:", json);
      res.json(json); // trả về cho client
    });
  });

  momoReq.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    res.status(500).json({ error: e.message });
  });

  momoReq.write(requestBody);
  momoReq.end();
};
