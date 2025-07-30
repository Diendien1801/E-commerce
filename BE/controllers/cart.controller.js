const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Inventory = require("../models/inventory.model");

// API 1: Thêm sản phẩm vào giỏ hàng (nếu có rồi thì +1 quantity)
exports.addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Kiểm tra product tồn tại và chưa bị xóa
    const product = await Product.findOne({
      _id: productId,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Kiểm tra tồn kho
    const inventory = await Inventory.findOne({ productId });
    if (!inventory || inventory.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product out of stock",
      });
    }

    // Tìm hoặc tạo cart cho user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Sản phẩm đã có -> tăng quantity lên 1
      const newQuantity = cart.items[existingItemIndex].quantity + 1;

      // Kiểm tra tồn kho có đủ không
      if (inventory.quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceAtTime = product.price; // Cập nhật giá mới nhất
    } else {
      // Sản phẩm chưa có -> thêm mới với quantity = 1
      cart.items.push({
        productId,
        quantity: 1,
        priceAtTime: product.price,
        addedAt: new Date(),
      });
    }

    await cart.save();

    // Populate để trả về thông tin đầy đủ
    await cart.populate("items.productId", "title price imageUrl status");

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// API 2: Xóa sản phẩm khỏi giỏ hàng (giảm quantity, nếu <1 thì xóa hoàn toàn)
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Giảm quantity đi 1
    cart.items[itemIndex].quantity -= 1;

    // Nếu quantity < 1 thì xóa item khỏi giỏ hàng
    if (cart.items[itemIndex].quantity < 1) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();

    // Populate để trả về thông tin đầy đủ
    await cart.populate("items.productId", "title price imageUrl status");

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

// API 3: Lấy thông tin giỏ hàng của 1 người dùng
exports.getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ userId })
      .populate("items.productId", "title price imageUrl status isDeleted")
      .populate("userId", "name email");

    if (!cart) {
      // Tạo giỏ hàng trống nếu chưa có
      cart = new Cart({ userId, items: [] });
      await cart.save();

      return res.status(200).json({
        success: true,
        message: "Empty cart created",
        data: {
          cart: cart,
          summary: {
            totalItems: 0,
            totalAmount: 0,
            itemCount: 0,
          },
        },
      });
    }

    // Lọc bỏ các sản phẩm đã bị xóa
    const validItems = cart.items.filter(
      (item) => item.productId && !item.productId.isDeleted
    );

    // Nếu có sản phẩm bị xóa thì cập nhật lại cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Tính toán summary
    const summary = {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length,
    };

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: {
        cart: cart,
        summary: summary,
      },
    });
  } catch (error) {
    console.error("getCartByUserId error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};
