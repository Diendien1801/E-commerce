const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: "https://localhost:3000" }));
const userRoutes = require("./routes/user.route"); // user
const crawlRoute = require("./routes/crawl.route");// crawl data
const productRoutes = require("./routes/product.route"); // product

const authFBRoute = require("./routes/authenticationFB.route"); // Facebook authentication




const authRoutes = require('./routes/auth.route'); //authentication

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use(crawlRoute);

app.use('/api', require('./routes/order.route'));
app.use(authFBRoute);


app.use('/api/auth', authRoutes); 


module.exports = app;

//Product

