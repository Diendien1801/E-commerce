const { crawlAllCategories } = require("./productCrawl");

crawlAllCategories()
  .then(() => {
    console.log("✅ Crawl hoàn tất!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Lỗi khi crawl:", err);
    process.exit(1);
  });
