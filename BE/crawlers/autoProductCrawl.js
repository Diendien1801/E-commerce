const { crawlAllCategories } = require("./productCrawl");
const cron = require("node-cron");

// Crawl tự động mỗi ngày lúc 2h sáng
cron.schedule("0 2 * * *", () => {
  crawlAllCategories();
  console.log("Đã tự động crawl lúc 2h sáng!");
});
