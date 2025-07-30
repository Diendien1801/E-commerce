const User = require("../models/user.model");
const Order = require("../models/order.model");

// API: Soft delete tài khoản người dùng
exports.softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm và cập nhật trạng thái user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra nếu đã bị xóa
    if (user.isDeleted) {
      return res.status(400).json({
        success: false,
        error: "Tài khoản đã bị xóa trước đó",
      });
    }

    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.status = "suspended"; // Chuyển status thành suspended khi xóa
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đã xóa tài khoản người dùng thành công",
      data: {
        userId: user._id,
        email: user.email,
        status: user.status,
        deletedAt: user.deletedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi xóa tài khoản người dùng",
      detail: error.message,
    });
  }
};

// API: Khôi phục tài khoản người dùng
exports.restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm user bị xóa
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra nếu chưa bị xóa
    if (!user.isDeleted) {
      return res.status(400).json({
        success: false,
        error: "Tài khoản chưa bị xóa",
      });
    }

    // Khôi phục
    user.isDeleted = false;
    user.deletedAt = null;
    user.status = "active"; // Chuyển status thành active khi khôi phục
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đã khôi phục tài khoản người dùng thành công",
      data: {
        userId: user._id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        restoredAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi khôi phục tài khoản người dùng",
      detail: error.message,
    });
  }
};

// API: Lấy thông tin chi tiết người dùng và đơn hàng
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Lấy danh sách đơn hàng của user
    const orders = await Order.find({ idUser: userId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
      .lean();

    // Thống kê đơn hàng
    const orderStats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: orders.filter((o) => o.status === "complete").length,
      canceledOrders: orders.filter((o) => o.status === "canceled").length,
      totalSpent: orders
        .filter((o) => o.status === "complete")
        .reduce((total, order) => {
          const orderTotal = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return total + orderTotal;
        }, 0),
    };

    // Format orders để hiển thị
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      idOrder: order.idOrder,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
      items: order.items,
    }));

    res.status(200).json({
      success: true,
      data: {
        userInfo: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          avatar: user.avatar,
          isDeleted: user.isDeleted,
          deletedAt: user.deletedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        orderStats,
        orders: formattedOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thông tin chi tiết người dùng",
      detail: error.message,
    });
  }
};

// API: Lấy danh sách tất cả người dùng với phân trang
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all", // all, active, inactive, deleted
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Convert sang number
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter
    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    switch (status) {
      case "active":
        filter.isDeleted = { $ne: true };
        filter.status = "active";
        break;
      case "inactive":
        filter.isDeleted = { $ne: true };
        filter.status = "inactive";
        break;
      case "deleted":
        filter.isDeleted = true;
        break;
      case "all":
      default:
        // Không filter gì thêm
        break;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Lấy users với phân trang
    const users = await User.find(filter)
      .select(
        "email name phoneNumber avatar isDeleted deletedAt createdAt status"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .lean();

    // Đếm tổng số users
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNumber);

    // Lấy thống kê đơn hàng cho từng user (chỉ lấy số lượng để tối ưu performance)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ idUser: user._id });
        const completedOrders = await Order.countDocuments({
          idUser: user._id,
          status: "complete",
        });

        // Tính tổng chi tiêu (chỉ tính orders hoàn thành)
        const totalSpentResult = await Order.aggregate([
          {
            $match: {
              idUser: user._id.toString(),
              status: "complete",
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: {
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

        return {
          ...user,
          orderStats: {
            totalOrders: orderCount,
            completedOrders: completedOrders,
            totalSpent: totalSpentResult[0]?.totalSpent || 0,
          },
        };
      })
    );

    // Thống kê tổng quan
    const totalActiveUsers = await User.countDocuments({
      isDeleted: { $ne: true },
      status: "active",
    });
    const totalDeletedUsers = await User.countDocuments({ isDeleted: true });

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalUsers: totalUsers,
          limit: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        summary: {
          totalActiveUsers,
          totalDeletedUsers,
          totalAllUsers: await User.countDocuments({}),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách người dùng",
      detail: error.message,
    });
  }
};


// API: Tìm kiếm user theo ID hoặc tên với độ chính xác lỏng
exports.searchUsers = async (req, res) => {
  try {
    const { 
      q,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
        data: null
      });
    }

    // Build search filter với độ chính xác lỏng
    const searchFilter = {
      $or: []
    };

    // 1. Tìm trong ObjectId (user _id)
    if (/^[0-9a-fA-F]+$/.test(q)) {
      // Nếu query chứa hex characters, tìm trong _id
      searchFilter.$or.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: q,
            options: "i"
          }
        }
      });
    }

    // 2. Tìm trong fullName (partial matching)
    searchFilter.$or.push({
      fullName: { $regex: q, $options: 'i' }
    });

    // 3. Tìm trong email (partial matching)
    searchFilter.$or.push({
      email: { $regex: q, $options: 'i' }
    });

    // 4. Tìm trong phone number
    searchFilter.$or.push({
      phoneNumber: { $regex: q, $options: 'i' }
    });

    // 5. Tìm từng từ trong fullName (split words)
    const words = q.trim().split(/\s+/);
    if (words.length > 1) {
      // Nếu query có nhiều từ, tìm cả từng từ riêng biệt
      words.forEach(word => {
        if (word.length > 0) {
          searchFilter.$or.push({
            fullName: { $regex: word, $options: 'i' }
          });
        }
      });
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sort
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortDirection };

    // Count total documents
    const total = await User.countDocuments(searchFilter);

    // Find users với aggregation để có relevance scoring
    const users = await User.aggregate([
      { $match: searchFilter },
      {
        $addFields: {
          relevanceScore: {
            $switch: {
              branches: [
                // Exact _id match - highest score
                { 
                  case: { 
                    $regexMatch: { 
                      input: { $toString: "$_id" }, 
                      regex: `^${q}`, 
                      options: 'i' 
                    } 
                  }, 
                  then: 100 
                },
                // Exact fullName match
                { 
                  case: { $eq: [{ $toLower: '$fullName' }, q.toLowerCase()] }, 
                  then: 95 
                },
                // fullName starts with query
                { 
                  case: { $regexMatch: { input: '$fullName', regex: `^${q}`, options: 'i' } }, 
                  then: 80 
                },
                // Email exact match
                { 
                  case: { $eq: [{ $toLower: '$email' }, q.toLowerCase()] }, 
                  then: 75 
                },
                // Email starts with query
                { 
                  case: { $regexMatch: { input: '$email', regex: `^${q}`, options: 'i' } }, 
                  then: 70 
                },
                // Phone exact match
                { 
                  case: { $eq: ['$phoneNumber', q] }, 
                  then: 65 
                },
                // Contains in fullName
                { 
                  case: { $regexMatch: { input: '$fullName', regex: q, options: 'i' } }, 
                  then: 50 
                },
                // Partial _id match
                { 
                  case: { 
                    $regexMatch: { 
                      input: { $toString: "$_id" }, 
                      regex: q, 
                      options: 'i' 
                    } 
                  }, 
                  then: 40 
                }
              ],
              default: 20
            }
          }
        }
      },
      // Sort by relevance first, then by specified sort
      { 
        $sort: { 
          relevanceScore: -1,
          [sortBy]: sortDirection 
        } 
      },
      {
        $project: {
          _id: 1,
          email: 1,
          fullName: 1,
          phoneNumber: 1,
          avatar: 1,
          isDeleted: 1,
          status: 1,
          createdAt: 1,
          relevanceScore: 1
        }
      },
      { $skip: skip },
      { $limit: limitNumber }
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      message: `Found ${total} user(s) matching "${q}"`,
      data: {
        users: users,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalUsers: total,
          usersPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        },
        searchQuery: q,
        
      }
    });

  } catch (error) {
    console.error("searchUsers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching users",
      data: null
    });
  }
};