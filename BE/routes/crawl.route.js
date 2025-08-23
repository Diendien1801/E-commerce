const express = require("express");
const router = express.Router();
const { crawlAllCategories } = require("../crawlers/productCrawl");
const mongoose = require("mongoose");
const { testlog } = require("../crawlers/testLog");
// Import Product model
const Product = require("../models/product.model");
const { addLog, getLogs, clearLogs } = require("../utils/log");
// Crawler status tracking
let crawlerStatus = {
  isRunning: false,
  startTime: null,
  endTime: null,
  progress: 0,
  currentCategory: "",
  totalProducts: 0,
  processedProducts: 0,
  errors: [],
};

clearLogs();
addLog("info", "🚀 Crawler đã được khởi động", "system");

// Start crawling
router.post("/start", async (req, res) => {
  try {
    if (crawlerStatus.isRunning) {
      return res.status(400).json({
        success: false,
        message: "Crawler đang chạy, vui lòng đợi hoàn thành",
      });
    }

    // Reset status and logs
    crawlerStatus = {
      isRunning: true,
      startTime: new Date(),
      endTime: null,
      progress: 0,
      currentCategory: "",
      totalProducts: 0,
      processedProducts: 0,
      errors: [],
    };

    // Clear old logs and add start log
    crawlerLogs = [];
    addLog("info", "🚀 Crawler đã được khởi động", "system");

    console.log("🚀 Starting crawler...");
    testlog(crawlerStatus);
    // Start crawling in background
    crawlAllCategories()
      .then(() => {
        crawlerStatus.isRunning = false;
        crawlerStatus.endTime = new Date();
        crawlerStatus.progress = 100;
        addLog("success", "✅ Crawling hoàn thành thành công!", "system");
        console.log("✅ Crawling completed successfully");
      })
      .catch((error) => {
        crawlerStatus.isRunning = false;
        crawlerStatus.endTime = new Date();
        crawlerStatus.errors.push(error.message);
        addLog("error", `❌ Crawling thất bại: ${error.message}`, "system");
        console.error("❌ Crawling failed:", error);
      });

    res.json({
      success: true,
      message: "Crawler đã được khởi động thành công",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error starting crawler:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Stop crawling (force stop)
router.post("/stop", async (req, res) => {
  try {
    if (!crawlerStatus.isRunning) {
      return res.status(400).json({
        success: false,
        message: "Crawler không đang chạy",
      });
    }

    // Force stop
    crawlerStatus.isRunning = false;
    crawlerStatus.endTime = new Date();
    addLog("warning", "⚠️ Crawler đã được dừng thủ công", "system");

    res.json({
      success: true,
      message: "Crawler đã được dừng",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error stopping crawler:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get crawler status
router.get("/status", (req, res) => {
  res.json({
    success: true,
    data: crawlerStatus,
  });
});

// Get crawler logs with filtering
router.get("/logs", (req, res) => {
  const { level, type, limit = 100 } = req.query;
  let filteredLogs = [...getLogs()];

  if (level) filteredLogs = filteredLogs.filter((log) => log.level === level);
  if (type) filteredLogs = filteredLogs.filter((log) => log.type === type);

  filteredLogs = filteredLogs.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: {
      logs: filteredLogs,
      total: getLogs().length,
      filtered: filteredLogs.length,
    },
  });
});

// Add log manually (for testing)
router.post("/logs", (req, res) => {
  const { level, message, type, data } = req.body;

  if (!level || !message) {
    return res.status(400).json({
      success: false,
      message: "Level và message là bắt buộc",
    });
  }

  const log = addLog(level, message, type, data);

  res.json({
    success: true,
    data: log,
  });
});

// Get categories info with real product counts
router.get("/categories", async (req, res) => {
  try {
    const categories = [
      { id: 101, name: "Ấn Bản Có Chữ Ký", parentID: 1, count: 0 },
      { id: 102, name: "CD + DVD", parentID: 1, count: 0 },
      { id: 103, name: "Băng Cassette", parentID: 1, count: 0 },
      { id: 104, name: "Đĩa đơn", parentID: 1, count: 0 },
      { id: 105, name: "Times' Merchandise", parentID: 1, count: 0 },
      { id: 201, name: "Ấn Bản Có Chữ Ký", parentID: 2, count: 0 },
      { id: 202, name: "CD + DVD", parentID: 2, count: 0 },
      { id: 203, name: "Đĩa Than", parentID: 2, count: 0 },
      { id: 204, name: "Đĩa Đơn", parentID: 2, count: 0 },
      { id: 205, name: "Băng Cassette", parentID: 2, count: 0 },
      { id: 301, name: "Autographed", parentID: 3, count: 0 },
      { id: 302, name: "CD + DVD", parentID: 3, count: 0 },
      { id: 303, name: "Vinyl", parentID: 3, count: 0 },
      { id: 304, name: "Single", parentID: 3, count: 0 },
      { id: 305, name: "Cassette Tape", parentID: 3, count: 0 },
    ];

    // Get real product counts for each category
    for (let category of categories) {
      try {
        const count = await Product.countDocuments({
          idCategory: category.id,
          isDeleted: { $ne: true }, // Exclude deleted products
        });
        category.count = count;
      } catch (error) {
        console.error(
          `Error counting products for category ${category.id}:`,
          error
        );
        category.count = 0;
      }
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get products count by category
router.get("/products/count", async (req, res) => {
  try {
    // Get total products count
    const total = await Product.countDocuments({ isDeleted: { $ne: true } });

    // Get count by category
    const byCategory = {};
    const categories = [
      1, 2, 3, 101, 102, 103, 104, 105, 201, 202, 203, 204, 205, 301, 302, 303,
      304, 305,
    ];

    for (const categoryId of categories) {
      try {
        const count = await Product.countDocuments({
          idCategory: categoryId,
          isDeleted: { $ne: true },
        });
        byCategory[categoryId] = count;
      } catch (error) {
        console.error(
          `Error counting products for category ${categoryId}:`,
          error
        );
        byCategory[categoryId] = 0;
      }
    }

    res.json({
      success: true,
      data: {
        total,
        byCategory,
      },
    });
  } catch (error) {
    console.error("Error getting products count:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get products by category
router.get("/products/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = "title" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({
      idCategory: parseInt(categoryId),
      isDeleted: { $ne: true },
    })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select("title price imageUrl status quantity createdAt");

    const total = await Product.countDocuments({
      idCategory: parseInt(categoryId),
      isDeleted: { $ne: true },
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get recent products
router.get("/products/recent", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("title price imageUrl status quantity createdAt");

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching recent products:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get products statistics
router.get("/products/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
    });
    const availableProducts = await Product.countDocuments({
      status: "available",
      isDeleted: { $ne: true },
    });
    const outOfStockProducts = await Product.countDocuments({
      status: "out_of_stock",
      isDeleted: { $ne: true },
    });

    // Get average price
    const avgPriceResult = await Product.aggregate([
      { $match: { isDeleted: { $ne: true }, price: { $gt: 0 } } },
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);
    const avgPrice =
      avgPriceResult.length > 0 ? Math.round(avgPriceResult[0].avgPrice) : 0;

    // Get products added today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayProducts = await Product.countDocuments({
      createdAt: { $gte: today },
      isDeleted: { $ne: true },
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        availableProducts,
        outOfStockProducts,
        avgPrice,
        todayProducts,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching products statistics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Crawler API is running",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
});

// Export addLog function for use in productCrawl.js
module.exports = { router };
