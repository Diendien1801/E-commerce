const express = require("express");
const app = express();
const userRoutes = require("./routes/user.route"); // user
const crawlRoute = require("./routes/crawl.route");// crawl data
app.use(express.json());
app.use("/api/users", userRoutes);

app.use(crawlRoute);
module.exports = app;
