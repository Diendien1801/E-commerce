const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysis.controller");

// =================================== ĐƠN HÀNG ===================================
// Số lượng đơn hàng theo trạng thái (tất cả đơn hàng)
// GET http://localhost:5000/api/analysis/orders/status
router.get("/orders/status", analysisController.getOrdersByStatus);


// Thống kê phân tích chi tiết theo status và thời gian
// GET http://localhost:5000/api/analysis/orders/analytics?startDate=2024-01-01&endDate=2024-12-31
router.get("/orders/analytics", analysisController.getOrdersAnalytics);


// Thống kê tổng quan dashboard
// GET http://localhost:5000/api/analysis/dashboard
//router.get("/dashboard", analysisController.getDashboardStats);

// =================================== SẢN PHẨM ===================================
// Số lượng sản phẩm theo danh mục
// GET http://localhost:5000/api/analysis/products/categories
router.get("/products/categories", analysisController.getProductsByCategory);
// Sản phẩm bán chạy nhất cùng với doanh thu và thông tin về sản phẩm
// GET http://localhost:5000/api/analysis/products/top-selling
router.get("/products/top-selling", analysisController.getTopSellingProducts);


// ====== Chưa dùng được ======
// Sản phẩm tồn kho thấp 
// GET http://localhost:5000/api/analysis/products/low-stock
// router.get("/products/low-stock", analysisController.getLowStockProducts);
// =============================




// =================================== DOANH THU ===================================
// API: Doanh thu theo thời gian
// GET http://localhost:5000/api/analysis/revenue/by-time?startDate=2024-01-01&endDate=2024-12-31
router.get("/revenue/by-time", analysisController.getRevenueByTime);
// API: So sánh doanh thu theo kỳ
// GET http://localhost:5000/api/analysis/revenue/compare?compareType=month&currentPeriod=2024-07&previousPeriod=2024-06
//router.get("/revenue/compare", analysisController.compareRevenue);

// =================================== NGƯỜI DÙNG ===================================
// API: Trả về thông tin và số lượng người dùng chưa mua hàng (phân trang)
// GET http://localhost:5000/api/analysis/users/no-orders?page=1&limit=10
router.get("/users/no-orders", analysisController.getUsersWithNoOrders);
module.exports = router;
