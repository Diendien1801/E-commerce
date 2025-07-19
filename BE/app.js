const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "http://localhost:3000" }));
const userRoutes = require("./routes/user.route"); // user
const crawlRoute = require("./routes/crawl.route");// crawl data
const productRoutes = require("./routes/product.route"); // product
const authFBRoute = require("./routes/authenticationFB.route"); // Facebook authentication



app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use(crawlRoute);
app.use('/api', require('./routes/order.route'));
app.use(authFBRoute);



module.exports = app;

//Product

