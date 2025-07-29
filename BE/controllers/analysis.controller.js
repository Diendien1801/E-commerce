const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const Product = require("../models/product.model");
const Categories = require("../models/categories.model");
const User = require("../models/user.model");
// API: Lấy số lượng đơn hàng theo trạng thái
exports.getOrdersByStatus = async (req, res) => {
  try {
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Tổng số đơn hàng
    const totalOrders = await Order.countDocuments();

    // Format response
    const result = {
      totalOrders,
      statusBreakdown: orderStats.map((stat) => ({
        status: stat._id,
        count: stat.count,
        percentage: ((stat.count / totalOrders) * 100).toFixed(2),
        totalAmount: stat.totalAmount,
      })),
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê đơn hàng theo trạng thái",
      detail: error.message,
    });
  }
};

// API: Thống kê chi tiết theo status và thời gian
exports.getOrdersAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "status" } = req.query;

    // Build match filter
    let matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate theo status
    const statusStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
          avgOrderValue: {
            $avg: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Thống kê theo payment method
    const paymentStats = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Thống kê theo ngày (nếu có filter thời gian)
    let dailyStats = [];
    if (startDate && endDate) {
      dailyStats = await Order.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              status: "$status",
            },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      { $multiply: ["$$this.price", "$$this.quantity"] },
                    ],
                  },
                },
              },
            },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);
    }

    const totalOrders = await Order.countDocuments(matchFilter);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          dateRange: { startDate, endDate },
        },
        statusBreakdown: statusStats,
        paymentMethodBreakdown: paymentStats,
        dailyStats: dailyStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê phân tích đơn hàng",
      detail: error.message,
    });
  }
};

// API: Thống kê tổng quan dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Thống kê cơ bản
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "complete" });
    const canceledOrders = await Order.countDocuments({ status: "canceled" });

    // Thống kê payment
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "completed",
    });
    const pendingPayments = await Payment.countDocuments({ status: "pending" });

    // Doanh thu hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: "complete",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    // Doanh thu tháng này
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thisMonth },
          status: "complete",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] },
                  ],
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          canceled: canceledOrders,
          completionRate:
            totalOrders > 0
              ? ((completedOrders / totalOrders) * 100).toFixed(2)
              : 0,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          successRate:
            totalPayments > 0
              ? ((completedPayments / totalPayments) * 100).toFixed(2)
              : 0,
        },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          thisMonth: monthlyRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê dashboard",
      detail: error.message,
    });
  }
};


// Sản phẩm bán chạy nhất cùng với doanh thu và thông tin về sản phẩm
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Cho phép tùy chỉnh số lượng sản phẩm

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productID",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderCount: { $sum: 1 }, // Số lần được đặt hàng
          avgPrice: { $avg: "$items.price" }, // Giá trung bình
          minPrice: { $min: "$items.price" }, // Giá thấp nhất
          maxPrice: { $max: "$items.price" }, // Giá cao nhất
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Helper function để tìm sản phẩm
    const mongoose = require('mongoose');
    const findProductByAnyId = async (productId) => {
      if (mongoose.Types.ObjectId.isValid(productId) && productId.length === 24) {
        const product = await Product.findById(productId);
        if (product) return product;
      }
      
      return await Product.findOne({
        $or: [
          { title: productId },
          { productCode: productId },
          { sku: productId }
        ]
      });
    };

    // Lấy toàn bộ thông tin sản phẩm
    const result = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await findProductByAnyId(tp._id);
        
        return {
          // Thông tin từ aggregation
          productId: tp._id,
          salesData: {
            totalQuantity: tp.totalQuantity,
            totalRevenue: tp.totalRevenue,
            orderCount: tp.orderCount,
            avgPrice: Math.round(tp.avgPrice),
            minPrice: tp.minPrice,
            maxPrice: tp.maxPrice,
            revenuePerOrder: Math.round(tp.totalRevenue / tp.orderCount),
            avgQuantityPerOrder: Math.round(tp.totalQuantity / tp.orderCount * 100) / 100
          },
          
          // Toàn bộ thông tin sản phẩm
          productInfo: product ? {
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            imageUrl: product.imageUrl,
            idCategory: product.idCategory,
            categoryName: product.categoryName,
            status: product.status,
            related: product.related,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          } : {
            title: "Unknown Product",
            status: "not_found"
          },
          
          // Thông tin phân tích thêm
          performance: {
            rank: topProducts.indexOf(tp) + 1,
            marketShare: 0, // Sẽ tính sau
            growthRate: 0, // Có thể tính so với tháng trước
            profitMargin: product ? 
              Math.round(((tp.avgPrice - (product.price || 0)) / tp.avgPrice) * 100) : 0
          }
        };
      })
    );

    // Tính market share cho từng sản phẩm
    const totalRevenue = result.reduce((sum, item) => sum + item.salesData.totalRevenue, 0);
    result.forEach(item => {
      item.performance.marketShare = totalRevenue > 0 ? 
        Math.round((item.salesData.totalRevenue / totalRevenue) * 10000) / 100 : 0;
    });

    // Thống kê tổng quan
    const summary = {
      totalProducts: result.length,
      totalQuantitySold: result.reduce((sum, item) => sum + item.salesData.totalQuantity, 0),
      totalRevenue: totalRevenue,
      avgRevenuePerProduct: Math.round(totalRevenue / result.length),
      topCategory: result.length > 0 ? result[0].productInfo.categoryName : null,
      dateGenerated: new Date()
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        products: result
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê sản phẩm bán chạy",
      detail: error.message,
    });
  }
};

// API: Thống kê số lượng sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
  try {
    const Category = require("../models/categories.model"); // Import Category model

    // Lấy tất cả categories từ bảng Categories
    const allCategories = await Category.find({}).lean();

    // Đếm số sản phẩm cho từng category
    const categoriesWithProducts = await Promise.all(
      allCategories.map(async (category) => {
        // Đếm số sản phẩm trong category này
        const productCount = await Product.countDocuments({ 
          idCategory: category.idCategory 
        });

        // Lấy thêm thông tin về trạng thái sản phẩm
        const availableProducts = await Product.countDocuments({
          idCategory: category.idCategory,
          status: "available"
        });

        const outOfStockProducts = await Product.countDocuments({
          idCategory: category.idCategory,
          status: "out_of_stock"
        });

        return {
          // Thông tin đầy đủ về category
          categoryInfo: {
            _id: category._id,
            idCategory: category.idCategory,
            nameCategory: category.nameCategory, // Đổi từ categoryName
            image: category.image || null,
            parentID: category.parentID || null,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          },
          
          // Thống kê sản phẩm
          productStats: {
            totalProducts: productCount,
            availableProducts: availableProducts,
            outOfStockProducts: outOfStockProducts,
            stockRate: productCount > 0 ? 
              Math.round((availableProducts / productCount) * 100) : 0
          }
        };
      })
    );

    // Sắp xếp theo số lượng sản phẩm giảm dần
    categoriesWithProducts.sort((a, b) => 
      b.productStats.totalProducts - a.productStats.totalProducts
    );

    // Thống kê tổng quan
    const summary = {
      totalCategories: allCategories.length,
      totalProducts: categoriesWithProducts.reduce(
        (sum, cat) => sum + cat.productStats.totalProducts, 0
      ),
      categoriesWithProducts: categoriesWithProducts.filter(
        cat => cat.productStats.totalProducts > 0
      ).length,
      categoriesWithoutProducts: categoriesWithProducts.filter(
        cat => cat.productStats.totalProducts === 0
      ).length,
      avgProductsPerCategory: allCategories.length > 0 ? 
        Math.round(
          categoriesWithProducts.reduce(
            (sum, cat) => sum + cat.productStats.totalProducts, 0
          ) / allCategories.length
        ) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        categories: categoriesWithProducts
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê sản phẩm theo danh mục",
      detail: error.message,
    });
  }
};



// API: Sản phẩm tồn kho thấp
// exports.getLowStockProducts = async (req, res) => {
//     try {
//         const lowStockThreshold = 10; // Ngưỡng tồn kho thấp
//         const lowStockProducts = await Product.find({
//             stock: { $lte: lowStockThreshold },
//         }).select("name stock category");

//         res.status(200).json({
//             success: true,
//             data: lowStockProducts,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error: "Lỗi lấy thống kê sản phẩm tồn kho thấp",
//             detail: error.message,
//         });
//     }
// };

// API: Doanh thu theo thời gian
exports.getRevenueByTime = async (req, res) => {
  try {
    const { 
      period = 'month', // day, month, quarter, year
      startDate,
      endDate,
      year = new Date().getFullYear(),
      month,
      quarter
    } = req.query;

    // Build match filter
    let matchFilter = { status: 'complete' }; // Chỉ tính đơn hàng hoàn thành
    
    if (startDate && endDate) {
      matchFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Nếu không có startDate/endDate, tạo filter theo year/month/quarter
      const startOfPeriod = new Date(year, 0, 1); // Đầu năm
      const endOfPeriod = new Date(year, 11, 31, 23, 59, 59); // Cuối năm
      
      if (month) {
        startOfPeriod.setMonth(month - 1, 1);
        endOfPeriod.setMonth(month - 1 + 1, 0, 23, 59, 59);
      } else if (quarter) {
        const startMonth = (quarter - 1) * 3;
        startOfPeriod.setMonth(startMonth, 1);
        endOfPeriod.setMonth(startMonth + 3, 0, 23, 59, 59);
      }
      
      matchFilter.createdAt = {
        $gte: startOfPeriod,
        $lte: endOfPeriod
      };
    }

    // Định nghĩa group format theo period
    let groupFormat = {};
    let sortField = "";
    
    switch (period) {
      case 'day':
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
        sortField = "_id";
        break;
        
      case 'month':
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        sortField = "_id";
        break;
        
      case 'quarter':
        groupFormat = {
          year: { $year: "$createdAt" },
          quarter: {
            $ceil: { $divide: [{ $month: "$createdAt" }, 3] }
          }
        };
        sortField = "_id";
        break;
        
      case 'year':
        groupFormat = {
          year: { $year: "$createdAt" }
        };
        sortField = "_id.year";
        break;
    }

    const revenueData = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] }
                  ]
                }
              }
            }
          },
          totalOrders: { $sum: 1 },
          totalQuantity: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              }
            }
          },
          avgOrderValue: {
            $avg: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: ["$$this.price", "$$this.quantity"] }
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { [sortField]: 1 } }
    ]);

    // Format response data
    const formattedData = revenueData.map(item => {
      let periodLabel = "";
      
      switch (period) {
        case 'day':
          periodLabel = `${item._id.day}/${item._id.month}/${item._id.year}`;
          break;
        case 'month':
          periodLabel = `${item._id.month}/${item._id.year}`;
          break;
        case 'quarter':
          periodLabel = `Q${item._id.quarter}/${item._id.year}`;
          break;
        case 'year':
          periodLabel = `${item._id.year}`;
          break;
      }
      
      return {
        period: periodLabel,
        periodData: item._id,
        totalRevenue: item.totalRevenue,
        totalOrders: item.totalOrders,
        totalQuantity: item.totalQuantity,
        avgOrderValue: Math.round(item.avgOrderValue)
      };
    });

    // Tính tổng
    const summary = {
      period: period,
      totalPeriods: formattedData.length,
      totalRevenue: formattedData.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalOrders: formattedData.reduce((sum, item) => sum + item.totalOrders, 0),
      totalQuantity: formattedData.reduce((sum, item) => sum + item.totalQuantity, 0),
      avgRevenuePerPeriod: formattedData.length > 0 ? 
        Math.round(formattedData.reduce((sum, item) => sum + item.totalRevenue, 0) / formattedData.length) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        revenueData: formattedData
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thống kê doanh thu theo thời gian",
      detail: error.message
    });
  }
};
// API: So sánh doanh thu theo kỳ
exports.compareRevenue = async (req, res) => {
  try {
    const { 
      compareType = 'month', // month, quarter, year
      currentPeriod, // Kỳ hiện tại (format: 2024-07 cho tháng, 2024-Q1 cho quý, 2024 cho năm)
      previousPeriod // Kỳ trước (tương tự format)
    } = req.query;

    // Helper function để tạo date range từ period string
    const createDateRange = (periodStr, type) => {
      let startDate, endDate;
      
      switch (type) {
        case 'month':
          const [year, month] = periodStr.split('-');
          startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
          break;
          
        case 'quarter':
          const [qYear, quarterStr] = periodStr.split('-Q');
          const quarter = parseInt(quarterStr);
          const startMonth = (quarter - 1) * 3;
          startDate = new Date(parseInt(qYear), startMonth, 1);
          endDate = new Date(parseInt(qYear), startMonth + 3, 0, 23, 59, 59);
          break;
          
        case 'year':
          startDate = new Date(parseInt(periodStr), 0, 1);
          endDate = new Date(parseInt(periodStr), 11, 31, 23, 59, 59);
          break;
      }
      
      return { startDate, endDate };
    };

    // Tự động tính kỳ trước nếu không được cung cấp
    let currentRange, previousRange;
    
    if (currentPeriod) {
      currentRange = createDateRange(currentPeriod, compareType);
    } else {
      // Mặc định là kỳ hiện tại
      const now = new Date();
      let currentPeriodStr;
      
      if (compareType === 'month') {
        currentPeriodStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      } else if (compareType === 'quarter') {
        const quarter = Math.ceil((now.getMonth() + 1) / 3);
        currentPeriodStr = `${now.getFullYear()}-Q${quarter}`;
      } else {
        currentPeriodStr = `${now.getFullYear()}`;
      }
      
      currentRange = createDateRange(currentPeriodStr, compareType);
    }

    if (previousPeriod) {
      previousRange = createDateRange(previousPeriod, compareType);
    } else {
      // Tự động tính kỳ trước
      const currentStart = currentRange.startDate;
      let previousStart, previousEnd;
      
      if (compareType === 'month') {
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
        previousEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59);
      } else if (compareType === 'quarter') {
        previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 3, 1);
        previousEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59);
      } else {
        previousStart = new Date(currentStart.getFullYear() - 1, 0, 1);
        previousEnd = new Date(currentStart.getFullYear() - 1, 11, 31, 23, 59, 59);
      }
      
      previousRange = { startDate: previousStart, endDate: previousEnd };
    }

    // Helper function để lấy doanh thu trong khoảng thời gian
    const getRevenueInPeriod = async (startDate, endDate) => {
      const result = await Order.aggregate([
        {
          $match: {
            status: 'complete',
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      { $multiply: ["$$this.price", "$$this.quantity"] }
                    ]
                  }
                }
              }
            },
            totalOrders: { $sum: 1 },
            totalQuantity: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.quantity"] }
                }
              }
            }
          }
        }
      ]);
      
      return result[0] || { totalRevenue: 0, totalOrders: 0, totalQuantity: 0 };
    };

    // Lấy doanh thu cho cả 2 kỳ
    const [currentData, previousData] = await Promise.all([
      getRevenueInPeriod(currentRange.startDate, currentRange.endDate),
      getRevenueInPeriod(previousRange.startDate, previousRange.endDate)
    ]);

    // Tính toán so sánh
    const revenueChange = currentData.totalRevenue - previousData.totalRevenue;
    const revenueChangePercent = previousData.totalRevenue > 0 ? 
      Math.round((revenueChange / previousData.totalRevenue) * 10000) / 100 : 
      (currentData.totalRevenue > 0 ? 100 : 0);

    const orderChange = currentData.totalOrders - previousData.totalOrders;
    const orderChangePercent = previousData.totalOrders > 0 ? 
      Math.round((orderChange / previousData.totalOrders) * 10000) / 100 : 
      (currentData.totalOrders > 0 ? 100 : 0);

    const quantityChange = currentData.totalQuantity - previousData.totalQuantity;
    const quantityChangePercent = previousData.totalQuantity > 0 ? 
      Math.round((quantityChange / previousData.totalQuantity) * 10000) / 100 : 
      (currentData.totalQuantity > 0 ? 100 : 0);

    res.status(200).json({
      success: true,
      data: {
        compareType,
        currentPeriod: {
          dateRange: {
            startDate: currentRange.startDate,
            endDate: currentRange.endDate
          },
          revenue: currentData.totalRevenue,
          orders: currentData.totalOrders,
          quantity: currentData.totalQuantity,
          avgOrderValue: currentData.totalOrders > 0 ? 
            Math.round(currentData.totalRevenue / currentData.totalOrders) : 0
        },
        previousPeriod: {
          dateRange: {
            startDate: previousRange.startDate,
            endDate: previousRange.endDate
          },
          revenue: previousData.totalRevenue,
          orders: previousData.totalOrders,
          quantity: previousData.totalQuantity,
          avgOrderValue: previousData.totalOrders > 0 ? 
            Math.round(previousData.totalRevenue / previousData.totalOrders) : 0
        },
        comparison: {
          revenue: {
            change: revenueChange,
            changePercent: revenueChangePercent,
            trend: revenueChange > 0 ? 'increase' : revenueChange < 0 ? 'decrease' : 'stable'
          },
          orders: {
            change: orderChange,
            changePercent: orderChangePercent,
            trend: orderChange > 0 ? 'increase' : orderChange < 0 ? 'decrease' : 'stable'
          },
          quantity: {
            change: quantityChange,
            changePercent: quantityChangePercent,
            trend: quantityChange > 0 ? 'increase' : quantityChange < 0 ? 'decrease' : 'stable'
          }
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi so sánh doanh thu theo kỳ",
      detail: error.message
    });
  }
};


// API: Trả về thông tin và số lượng người dùng chưa mua hàng (phân trang)
exports.getUsersWithNoOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeDeleted = false } = req.query;

    // Convert sang number
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Lấy danh sách tất cả user IDs từ bảng Order
    const userIdsWithOrders = await Order.distinct("idUser");

    // Build filter cho User
    let userFilter = {
      _id: { $nin: userIdsWithOrders }, // Loại trừ users đã có đơn hàng
    };

    // Nếu không bao gồm user đã xóa
    if (!includeDeleted) {
      userFilter.isDeleted = { $ne: true };
    }

    // Lấy users chưa mua hàng với phân trang
    const usersWithNoOrders = await User.find(userFilter)
      .select("email fullName phoneNumber avatar createdAt isDeleted status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Đếm tổng số users chưa mua hàng
    const totalUsersWithNoOrders = await User.countDocuments(userFilter);
    const totalPages = Math.ceil(totalUsersWithNoOrders / limitNumber);

    // Thống kê chi tiết
    const totalUsers = await User.countDocuments(
      includeDeleted ? {} : { isDeleted: { $ne: true } }
    );
    const totalUsersWithOrders = userIdsWithOrders.length;
    const percentageWithNoOrders =
      totalUsers > 0
        ? Math.round((totalUsersWithNoOrders / totalUsers) * 100)
        : 0;

    

    res.status(200).json({
      success: true,
      data: {
        users: usersWithNoOrders,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalUsers: totalUsersWithNoOrders,
          limit: limitNumber,
          
        },
        statistics: {
          totalUsersWithNoOrders,
          totalUsersWithOrders,
          totalUsers,
          
        },
       
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi lấy thông tin người dùng chưa mua hàng",
      detail: error.message,
    });
  }
};

// Get count of users who never made a purchase
exports.getUsersNeverPurchasedCount = async (req, res) => {
  try {
    const Order = require("../models/order.model");
    
    // Lấy danh sách userID đã từng đặt hàng
    const userIdsWithOrders = await Order.distinct("idUser");
    
    // Đếm số user chưa từng mua (không có trong danh sách userID đã đặt hàng)
    const neverPurchasedCount = await User.countDocuments({
      _id: { $nin: userIdsWithOrders },
      isDeleted: { $ne: true } // Chỉ đếm user chưa bị xóa
    });
    
    res.status(200).json({
      success: true,
      message: "Users never purchased count retrieved successfully",
      data: {
        count: neverPurchasedCount
      }
    });
    
  } catch (error) {
    console.error("Error getting users never purchased count:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};

// Get user registration count by time period (year/month)
exports.getUserRegistrationByTime = async (req, res) => {
  try {
    const { period = "month", year, month } = req.query;
    
    let matchStage = {
      isDeleted: { $ne: true } // Chỉ tính user chưa bị xóa
    };
    
    // Thêm filter theo năm nếu có
    if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year) + 1, 0, 1);
      matchStage.createdAt = {
        $gte: startOfYear,
        $lt: endOfYear
      };
    }
    
    // Thêm filter theo tháng nếu có
    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 1);
      matchStage.createdAt = {
        $gte: startOfMonth,
        $lt: endOfMonth
      };
    }
    
    let groupStage;
    let sortStage;
    
    if (period === "year") {
      // Group theo năm
      groupStage = {
        _id: { $year: "$createdAt" },
        count: { $sum: 1 },
        year: { $first: { $year: "$createdAt" } }
      };
      sortStage = { year: 1 };
    } else {
      // Group theo tháng
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 },
        year: { $first: { $year: "$createdAt" } },
        month: { $first: { $month: "$createdAt" } }
      };
      sortStage = { year: 1, month: 1 };
    }
    
    const registrationData = await User.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: sortStage }
    ]);
    
    // Format response data
    const formattedData = registrationData.map(item => {
      if (period === "year") {
        return {
          year: item.year,
          count: item.count,
          period: `${item.year}`
        };
      } else {
        return {
          year: item.year,
          month: item.month,
          count: item.count,
          period: `${item.year}-${String(item.month).padStart(2, '0')}`
        };
      }
    });
    
    // Tính tổng
    const totalRegistrations = formattedData.reduce((sum, item) => sum + item.count, 0);
    
    res.status(200).json({
      success: true,
      message: `User registrations by ${period} retrieved successfully`,
      data: {
        period: period,
        totalRegistrations: totalRegistrations,
        registrations: formattedData
      }
    });
    
  } catch (error) {
    console.error("Error getting user registrations by time:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};

// Get products count by category for stack chart
exports.getProductsByCategory = async (req, res) => {
  try {
    const Product = require("../models/product.model");
    const Category = require("../models/categories.model");
    
    // Aggregate để đếm sản phẩm theo idCategory
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$idCategory",
          productCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories", // Tên collection của Category
          localField: "_id",
          foreignField: "idCategory", 
          as: "categoryInfo"
        }
      },
      {
        $project: {
          idCategory: "$_id",
          productCount: 1,
          categoryName: { 
            $arrayElemAt: ["$categoryInfo.nameCategory", 0] 
          },
          parentID: { 
            $arrayElemAt: ["$categoryInfo.parentID", 0] 
          }
        }
      },
      {
        $sort: { idCategory: 1 }
      }
    ]);
    
    // Tính tổng số sản phẩm
    const totalProducts = productsByCategory.reduce((sum, cat) => sum + cat.productCount, 0);
    
    // Group theo parent category để tạo stack chart data
    const parentCategories = {};
    
    for (const item of productsByCategory) {
      const parentId = item.parentID || 'other';
      
      if (!parentCategories[parentId]) {
        // Lấy thông tin parent category
        let parentName = 'Other';
        if (item.parentID) {
          const parent = await Category.findOne({ idCategory: item.parentID });
          parentName = parent ? parent.nameCategory : `Parent ${item.parentID}`;
        }
        
        parentCategories[parentId] = {
          parentID: item.parentID,
          parentName: parentName,
          totalProducts: 0,
          categories: []
        };
      }
      
      parentCategories[parentId].totalProducts += item.productCount;
      parentCategories[parentId].categories.push({
        idCategory: item.idCategory,
        categoryName: item.categoryName || `Category ${item.idCategory}`,
        productCount: item.productCount
      });
    }
    
    // Chuyển đổi thành array và sắp xếp
    const stackChartData = Object.values(parentCategories).map(parent => ({
      ...parent,
      categories: parent.categories.sort((a, b) => a.idCategory - b.idCategory)
    })).sort((a, b) => (a.parentID || 999) - (b.parentID || 999));
    
    // Data cho simple chart (nếu frontend cần)
    const simpleChartData = productsByCategory.map(item => ({
      idCategory: item.idCategory,
      categoryName: item.categoryName || `Category ${item.idCategory}`,
      productCount: item.productCount,
      percentage: Math.round((item.productCount / totalProducts) * 100)
    }));
    
    res.status(200).json({
      success: true,
      message: "Products by category retrieved successfully",
      data: {
        totalProducts: totalProducts,
        stackChart: stackChartData,
        simpleChart: simpleChartData,
        summary: {
          totalCategories: productsByCategory.length,
          totalParentCategories: Object.keys(parentCategories).length
        }
      }
    });
    
  } catch (error) {
    console.error("Error getting products by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};

// Get top 10 products with highest stock
exports.getTopStockProducts = async (req, res) => {
  try {
    const Inventory = require("../models/inventory.model");
    const Product = require("../models/product.model");
    
    const limit = parseInt(req.query.limit) || 10;
    
    // Lấy top products với tồn kho cao nhất
    const topStockProducts = await Inventory.aggregate([
      {
        $match: {
          quantity: { $gt: 0 } // Chỉ lấy sản phẩm có tồn kho > 0
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $unwind: "$productInfo"
      },
      {
        $match: {
          "productInfo.isDeleted": { $ne: true } // Chỉ lấy sản phẩm chưa bị xóa
        }
      },
      {
        $project: {
          title: "$productInfo.title",
          price: "$productInfo.price",
          currentStock: "$quantity",
          productImage: { $arrayElemAt: ["$productInfo.imageUrl", 0] },
          status: "$productInfo.status",
          idCategory: "$productInfo.idCategory"
        }
      },
      {
        $sort: { currentStock: -1 } // Sắp xếp theo số lượng giảm dần
      },
      {
        $limit: limit
      }
    ]);
    
    // Tính tổng tồn kho của top products
    const totalStockValue = topStockProducts.reduce((sum, product) => sum + product.currentStock, 0);
    
    res.status(200).json({
      success: true,
      message: `Top ${limit} highest stock products retrieved successfully`,
      data: {
        totalProducts: topStockProducts.length,
        totalStockValue: totalStockValue,
        products: topStockProducts
      }
    });
    
  } catch (error) {
    console.error("Error getting top stock products:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};

// Get total canceled orders count
exports.getTotalCanceledOrders = async (req, res) => {
  try {
    const Order = require("../models/order.model");
    
    const { year, startDate, endDate } = req.query;
    
    let matchStage = {
      status: "canceled"
    };
    
    // Filter theo thời gian nếu có
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year) + 1, 0, 1);
      matchStage.createdAt = {
        $gte: startOfYear,
        $lt: endOfYear
      };
    }
    
    const canceledCount = await Order.countDocuments(matchStage);
    
    // Tính tổng giá trị đơn hàng bị hủy
    const canceledValue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: ["$$this.quantity", "$$this.price"] }] }
              }
            }
          }
        }
      }
    ]);
    
    const totalCanceledAmount = canceledValue.length > 0 ? canceledValue[0].totalAmount : 0;
    
    res.status(200).json({
      success: true,
      message: "Total canceled orders retrieved successfully",
      data: {
        totalCanceledOrders: canceledCount,
        totalCanceledAmount: totalCanceledAmount
      }
    });
    
  } catch (error) {
    console.error("Error getting total canceled orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};

// Get total completed orders count
exports.getTotalCompletedOrders = async (req, res) => {
  try {
    const Order = require("../models/order.model");
    
    const { year, startDate, endDate } = req.query;
    
    let matchStage = {
      status: "completed"
    };
    
    // Filter theo thời gian nếu có
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year) + 1, 0, 1);
      matchStage.createdAt = {
        $gte: startOfYear,
        $lt: endOfYear
      };
    }
    
    const completedCount = await Order.countDocuments(matchStage);
    
    // Tính tổng giá trị đơn hàng hoàn thành
    const completedValue = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: ["$$this.quantity", "$$this.price"] }] }
              }
            }
          }
        }
      }
    ]);
    
    const totalCompletedAmount = completedValue.length > 0 ? completedValue[0].totalAmount : 0;
    
    res.status(200).json({
      success: true,
      message: "Total completed orders retrieved successfully",
      data: {
        totalCompletedOrders: completedCount,
        totalCompletedAmount: totalCompletedAmount
      }
    });
    
  } catch (error) {
    console.error("Error getting total completed orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
      detail: error.message
    });
  }
};