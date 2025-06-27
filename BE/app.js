const express = require("express");
const app = express();
const userRoutes = require("./routes/user.route"); // user
const crawlRoute = require("./routes/crawl.route");// crawl data
const productRoutes = require("./routes/product.route"); // product
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use(crawlRoute);
module.exports = app;

//Product

