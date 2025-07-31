const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "https://localhost:3000" }));
const userRoutes = require("./routes/user.route"); // user
const crawlRoute = require("./routes/crawl.route");// crawl data
const productRoutes = require("./routes/product.route"); // product

const authFBRoute = require("./routes/authenticationFB.route"); // Facebook authentication




const authRoutes = require('./routes/auth.route'); //authentication
const analysisRoutes = require("./routes/analysis.route");
const userManagementRoutes = require("./routes/userManagement.route"); // user management
const categoriesRoutes = require("./routes/categories.route"); // categories
const paymentRoutes = require("./routes/payment.route"); // payment
app.use(express.json());

app.use("/api/categories", categoriesRoutes); // categories
app.use("/api/userManagement", userManagementRoutes); // user management
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use(crawlRoute);

app.use('/api', require('./routes/order.route'));
app.use(authFBRoute);
app.use("/api/analysis", analysisRoutes);


app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

module.exports = app;

//Product

