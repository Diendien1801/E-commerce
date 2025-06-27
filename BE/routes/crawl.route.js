const express = require("express");
const router = express.Router();
const { crawlAllCategories } = require("../crawlers/productCrawl");

router.post("/api/crawl", async (req, res) => {
  await crawlAllCategories();
  res.json({ message: "Đã bắt đầu crawl!" });
});

module.exports = router;
