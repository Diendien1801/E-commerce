const express = require("express");
const router = express.Router();
const {
  crawlAllCategories,
  stopCrawl,
  resetCrawlState,
  crawlEmitter,
  getCategories,
  getCrawlStatus,
  testCrawlCapability,
} = require("../crawlers/productCrawl");

// Khai báo middleware xử lý SSE (Server-Sent Events)
const sseMiddleware = (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Gửi tin nhắn khi client connect
  sendSseMessage(res, "connected", { isCrawling: getCrawlStatus().isCrawling });

  // Thêm ping events để giữ kết nối
  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  // Dọn dẹp khi client disconnect
  req.on("close", () => {
    clearInterval(pingInterval);
    next();
  });
};

// Hàm gửi message qua SSE
const sendSseMessage = (res, type, data) => {
  res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
};

// API endpoints
// Lấy danh sách categories
router.get("/categories", async (req, res) => {
  try {
    const categories = getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test kết nối và khả năng crawl
router.get("/test", async (req, res) => {
  try {
    const tests = await testCrawlCapability();
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint để nhận SSE events
router.get("/stream", sseMiddleware, (req, res) => {
  // Handlers cho các events
  const logHandler = (data) => sendSseMessage(res, "log", data);
  const progressHandler = (data) => sendSseMessage(res, "progress", data);
  const statsHandler = (data) => sendSseMessage(res, "stats", data);
  const completeHandler = (data) =>
    sendSseMessage(res, "complete", { result: data });
  const errorHandler = (data) => sendSseMessage(res, "error", data);

  // Đăng ký listeners
  crawlEmitter.on("log", logHandler);
  crawlEmitter.on("progress", progressHandler);
  crawlEmitter.on("stats", statsHandler);
  crawlEmitter.on("complete", completeHandler);
  crawlEmitter.on("error", errorHandler);

  // Dọn dẹp khi client disconnect
  req.on("close", () => {
    crawlEmitter.off("log", logHandler);
    crawlEmitter.off("progress", progressHandler);
    crawlEmitter.off("stats", statsHandler);
    crawlEmitter.off("complete", completeHandler);
    crawlEmitter.off("error", errorHandler);
  });
});

// Bắt đầu crawl (có thể chỉ định category)
router.post("/", async (req, res) => {
  try {
    const { categories } = req.body;
    const status = getCrawlStatus();

    if (status.isCrawling) {
      return res.json({
        success: false,
        message:
          "Đang trong quá trình crawl. Vui lòng dừng trước khi bắt đầu lại.",
      });
    }

    // Bắt đầu crawl (async)
    const selectedCategories =
      categories && Array.isArray(categories) ? categories : null;
    crawlAllCategories(selectedCategories);

    res.json({ success: true, message: "Đã bắt đầu quá trình crawl!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dừng quá trình crawl
router.post("/stop", async (req, res) => {
  try {
    const status = getCrawlStatus();

    if (!status.isCrawling) {
      return res.json({
        success: false,
        message: "Không có quá trình crawl nào đang chạy.",
      });
    }

    stopCrawl();
    res.json({
      success: true,
      message:
        "Đã gửi lệnh dừng crawl, sẽ dừng sau khi hoàn thành sản phẩm hiện tại.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lấy trạng thái crawl hiện tại
router.get("/status", (req, res) => {
  try {
    const status = getCrawlStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset trạng thái crawl
router.post("/reset", (req, res) => {
  try {
    resetCrawlState();
    res.json({ success: true, message: "Đã reset trạng thái crawl." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
