import "./payment.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/context/authcontext';
// import LocationSelector from "../components/locationSelector/LocationSelector";
import MapView from "../components/map/MapView"
import PaymentAccount from "./component/PaymentAccount";
import PaymentDeliveryForm from "./component/PaymentDeliveryForm";
import PaymentShippingMethods from "./component/PaymentShippingMethods";
import PaymentPaymentMethods from "./component/PaymentPaymentMethods";
import PaymentCart from "./component/PaymentCart";
import PaymentSummary from "./component/PaymentSummary";

export default function Payment() {
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();
  const [activeTab, setActiveTab] = useState('delivery');
  const [showMap, setShowMap] = useState(false);


  const [inputRect, setInputRect] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  // state cho promotion
  const [promotions, setPromotions] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  useEffect(() => {
  fetch('http://localhost:5000/api/promotions')
    .then(res => res.json())
    .then(data => setPromotions(data.data || []));
}, []);
const handleApplyPromo = async () => {
  setPromoError('');
  setPromoDiscount(0);
  if (!promoCode) return setPromoError('Vui lòng nhập mã khuyến mãi');
  const orderValue = calculateCartTotal() + getSelectedShippingPrice();
  const res = await fetch('http://localhost:5000/api/promotions/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: promoCode, orderValue })
  });
  const data = await res.json();
  if (data.success) {
    setPromoDiscount(data.discount);
    setPromoError('');
  } else {
    setPromoError(data.message || 'Mã không hợp lệ');
  }
};
  // State cho user info và cart
  const [userInfo, setUserInfo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartError, setCartError] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    country: 'Vietnam',
    address: '', 
    location: '', 
    street: '',
    ward: '',
    district: '',
    city: '',
    zipCode: ''
  });

 const handleShowMap = () => {
    setShowMap(true);
  };

  const handleMapConfirm = (locationData) => {
    console.log('Selected location:', locationData);
    // { address: "123 Nguyễn Trãi...", lat: 21.0285, lng: 105.8542 }
    setFormData(prev => ({
      ...prev,
      location: locationData.address
    }));
    setShowMap(false);
  };

  // ✅ Thêm function handleLocationSelect cho LocationSelector
  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location: location
    }));
    // setShowLocationSelector(false);
  };

  // Thêm state cho order processing
  const [isProcessing, setIsProcessing] = useState(false);
  // Lấy userId từ context giống như profile
  const getCurrentUserId = () => {
    return loggedInUser?._id || loggedInUser?.userId || loggedInUser?.id;
  };

  // Fetch user info từ API
 const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để tiếp tục');
      }

      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin người dùng');
      }
      
      const data = await response.json();
      
      let userData;
      if (data.success && data.data) {
        userData = data.data;
        setUserInfo(userData);
      } else {
        userData = data;
        setUserInfo(userData);
      }

      // Lấy fullAddress từ userData
      const defaultLocation = userData.address?.fullAddress || '';

      setFormData(prev => ({
        ...prev,
        fullName: userData.name || userData.fullName || '',
        phone: userData.phoneNumber || '',
        location: defaultLocation,
        // Thêm các trường address chi tiết nếu cần
        street: userData.address?.street || '',
        ward: userData.address?.ward || '',
        district: userData.address?.district || '', 
        city: userData.address?.city || '',
        country: userData.address?.country || 'Vietnam',
        zipCode: userData.address?.zipCode || ''
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items từ API
  const fetchCartItems = async () => {
  try {
    setCartLoading(true);
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('Vui lòng đăng nhập để xem giỏ hàng');
    }

    const response = await fetch(`http://localhost:5000/api/cart/user/${userId}`);

    if (!response.ok) {
      throw new Error('Không thể lấy thông tin giỏ hàng');
    }

    const data = await response.json();

    // Lấy items từ response chuẩn
    const items = data?.data?.cart?.items || [];
    setCartItems(items);
    setCartError(null);
  } catch (err) {
    console.error('Error fetching cart:', err);
    setCartError(err.message);
    setCartItems([]);
  } finally {
    setCartLoading(false);
  }
};

  // Fetch user info và cart khi component mount
  useEffect(() => {
    if (loggedInUser) {
      fetchUserInfo();
      fetchCartItems();
    }
  }, [loggedInUser]);

  // Cập nhật phương thức giao hàng khi địa chỉ thay đổi
  useEffect(() => {
    if (formData.location) {
      updateShippingMethods(formData.location);
    } else {
      setShippingMethods([]);
      setSelectedShippingMethod('');
    }
  }, [formData.location]);

  // Cập nhật số lượng sản phẩm
const updateQuantity = async (itemId, newQuantity) => {
  const currentItem = cartItems.find(item => (item.productId?._id || item.productId) === itemId);
  if (!currentItem) return;

  const currentQuantity = currentItem.quantity;
  
  // Cập nhật UI ngay lập tức (optimistic update)
  setCartItems(prevItems => 
    prevItems.map(item => 
      (item.productId?._id || item.productId) === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ).filter(item => item.quantity > 0)
  );

  try {
    if (newQuantity > currentQuantity) {
      // Tăng quantity - gọi API add
      const addCount = newQuantity - currentQuantity;
      for (let i = 0; i < addCount; i++) {
        await fetch(`http://localhost:5000/api/cart/${getCurrentUserId()}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: itemId,
            quantity: 1
          })
        });
      }
    } else if (newQuantity < currentQuantity) {
      // Giảm quantity - gọi API remove
      const removeCount = currentQuantity - newQuantity;
      for (let i = 0; i < removeCount; i++) {
        await fetch(`http://localhost:5000/api/cart/${getCurrentUserId()}/remove/${itemId}`, {
          method: 'DELETE'
        });
      }
    }
  } catch (err) {
    console.error('Error updating quantity:', err);
    // Revert lại UI nếu API call thất bại
    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.productId?._id || item.productId) === itemId 
          ? { ...item, quantity: currentQuantity }
          : item
      )
    );
    alert('Có lỗi xảy ra khi cập nhật giỏ hàng');
  }
};

// Hàm tăng quantity
const increaseQuantity = (itemId) => {
  const currentItem = cartItems.find(item => (item.productId?._id || item.productId) === itemId);
  if (currentItem) {
    updateQuantity(itemId, currentItem.quantity + 1);
  }
};

// Hàm giảm quantity
const decreaseQuantity = (itemId) => {
  const currentItem = cartItems.find(item => (item.productId?._id || item.productId) === itemId);
  if (currentItem && currentItem.quantity > 1) {
    updateQuantity(itemId, currentItem.quantity - 1);
  } else if (currentItem && currentItem.quantity === 1) {
    // Hiển thị confirmation dialog khi quantity = 1
    const confirmed = window.confirm(
      `Bạn có thực sự muốn xóa "${currentItem.productId?.title || 'sản phẩm này'}" khỏi giỏ hàng?`
    );
    if (confirmed) {
      removeFromCart(itemId);
    }
  }
};

// Hàm xóa sản phẩm hoàn toàn
const removeFromCart = async (itemId) => {
  const itemToRemove = cartItems.find(item => (item.productId?._id || item.productId) === itemId);
  
  if (!itemToRemove) return;

  // Hiển thị confirmation dialog
  const confirmed = window.confirm(
    `Bạn có thực sự muốn xóa "${itemToRemove.productId?.title || 'sản phẩm này'}" khỏi giỏ hàng?`
  );

  if (!confirmed) return;

  // Optimistic update - xóa khỏi UI ngay
  setCartItems(prevItems => prevItems.filter(item => (item.productId?._id || item.productId) !== itemId));

  try {
    // Gọi API remove cho đến khi quantity = 0
    for (let i = 0; i < itemToRemove.quantity; i++) {
      await fetch(`http://localhost:5000/api/cart/${getCurrentUserId()}/remove/${itemId}`, {
        method: 'DELETE'
      });
    }
  } catch (err) {
    console.error('Error removing item:', err);
    // Revert lại nếu thất bại
    setCartItems(prevItems => [...prevItems, itemToRemove]);
    alert('Có lỗi xảy ra khi xóa sản phẩm');
  }
};

  const calculateCartTotal = () => {
  if (!cartItems || cartItems.length === 0) return 0;

  return cartItems.reduce((total, item) => {
    // Ưu tiên lấy priceAtTime, nếu không có thì lấy productId.price, nếu không có thì lấy price
    const price =
      item.priceAtTime ??
      
      
      item.price ??
      0;
    const quantity = item.quantity || 1;
    // Chỉ cộng tiền nếu giá > 0 (còn hàng)
    return price > 0 ? total + price * quantity : total;
  }, 0);
};

  const updateShippingMethods = (location) => {
    const isHanoi = location.includes('Ha Noi');
    const isHCM = location.includes('Ho Chi Minh');
    const isMajorCity = isHanoi || isHCM || location.includes('Da Nang') || location.includes('Can Tho');
    
    const methods = [
      {
        id: 'standard',
        name: 'Giao hàng tiêu chuẩn',
        description: isMajorCity ? '2-3 ngày làm việc' : '3-5 ngày làm việc',
        price: isMajorCity ? 35000 : 45000,
        icon: '🚚',
        recommended: !isMajorCity
      },
      {
        id: 'express',
        name: 'Giao hàng nhanh',
        description: isMajorCity ? '1-2 ngày làm việc' : '2-3 ngày làm việc',
        price: isMajorCity ? 55000 : 75000,
        icon: '⚡',
        recommended: isMajorCity
      }
    ];

    if (isHanoi || isHCM) {
      methods.push({
        id: 'same-day',
        name: 'Giao hàng trong ngày',
        description: 'Giao trong vòng 4-6 giờ',
        price: 85000,
        icon: '🚀',
        recommended: false
      });
    }

    setShippingMethods(methods);
    
    const recommended = methods.find(m => m.recommended);
    if (recommended) {
      setSelectedShippingMethod(recommended.id);
    } else {
      setSelectedShippingMethod(methods[0].id);
    }
  };

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: 'https://cdn1.iconfinder.com/data/icons/marketplace-and-shipping/64/COD_cash_on_delivery_shipping_payment_delivery-1024.png',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Thanh toán an toàn với PayPal',
      icon: 'https://seeklogo.com/images/P/paypal-logo-6ED6A5924E-seeklogo.com.png',
    },
    {
      id: 'vnpay',
      name: 'VNPAY',
      description: 'Thanh toán nhanh chóng qua ví điện tử VnPay',
      icon: 'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg',
    }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleClearField = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const handleLocationInputClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    setInputRect(rect);
    // setShowLocationSelector(true);
  };

  

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  const getSelectedShippingPrice = () => {
    const selected = shippingMethods.find(m => m.id === selectedShippingMethod);
    return selected ? selected.price : 0;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  // Hàm xử lý đặt hàng (thêm debug để kiểm tra)
const handlePlaceOrder = async () => {
  try {
    setIsProcessing(true);

    // Validate form data
    if (!formData.fullName || !formData.phone || !formData.location) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    if (!selectedShippingMethod) {
      alert('Vui lòng chọn phương thức giao hàng');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    // Tính tổng tiền
    const cartTotal = calculateCartTotal();
    const shippingCost = getSelectedShippingPrice();

    const totalAmount = cartTotal + shippingCost - promoDiscount;

    // Tạo order ID với timestamp và random để tránh trùng
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const orderId = `ORD_${timestamp}_${randomSuffix}`;

    console.log('Generated orderId:', orderId); // Debug log

    
    // Chuẩn bị dữ liệu order
    const orderData = {
      idOrder: orderId,
      idUser: userId,
      items: cartItems.map(item => ({
        productID: item.productId?._id || item.productId,
        quantity: item.quantity,
        price: item.productId?.price || item.price || 0
      })),
      status: 'pending',
      paymentMethod: selectedPaymentMethod,
      shippingAddress: `${formData.address ? formData.address + ', ' : ''}${formData.location}`
    };


    console.log('=== Order Data Before Send ===');
    console.log('Full orderData:', JSON.stringify(orderData, null, 2));
    console.log('idOrder field:', orderData.idOrder);
    console.log('typeof idOrder:', typeof orderData.idOrder);
    console.log('idOrder length:', orderData.idOrder?.length);

    const requiredFields = ['idOrder', 'idUser', 'items', 'paymentMethod', 'shippingAddress'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert(`Thiếu thông tin bắt buộc: ${missingFields.join(', ')}`);
      return;
    }

    // Tạo order
    console.log('Sending request to:', 'http://localhost:5000/api/orders');
    const orderResponse = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    console.log('Order response status:', orderResponse.status);
    
    // Log response headers
    console.log('Response headers:', Object.fromEntries(orderResponse.headers.entries()));

    const responseText = await orderResponse.text();
    console.log('Raw response:', responseText);

    let orderResult;
    try {
      orderResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!orderResponse.ok) {
      console.error('Order creation failed:', orderResult);
      throw new Error(orderResult.message || `HTTP ${orderResponse.status}: ${orderResponse.statusText}`);
    }

    console.log('Order created successfully:', orderResult);

    // Xử lý thanh toán
    if (selectedPaymentMethod === 'vnpay') {
      await handleMoMoPayment(totalAmount, orderId);
    } else if (selectedPaymentMethod === 'paypal') {
      await handlePayPalPayment(totalAmount, orderId);
    } else if (selectedPaymentMethod === 'cod') {
      // COD logic
      const paymentData = {
        id: `PAY_${orderId}_${Date.now()}`,
        userId: userId,
        orderId: orderId,
        method: "Cash on Delivery",
        amount: totalAmount,
        status: "pending"
      };

      const paymentResponse = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (paymentResponse.ok) {
  await clearCart();
  window.location.href = `/payment-result?status=success&orderId=${orderId}&amount=${totalAmount}`;
} else {
  const paymentError = await paymentResponse.json();
  throw new Error(paymentError.message || 'Không thể tạo thông tin thanh toán');
}
    }

  } catch (error) {
    console.error('=== Order Creation Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    alert(`Có lỗi xảy ra khi đặt hàng: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};
// Hàm clear cart sau khi đặt hàng thành công
const clearCart = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.log('No userId found, skipping cart clear');
      return;
    }

    console.log('Clearing cart for user:', userId);
    
    const response = await fetch(`http://localhost:5000/api/cart/${userId}/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      setCartItems([]);
      console.log('Cart cleared successfully');
    } else {
      console.error('Failed to clear cart:', response.status);
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    // Không throw error vì đây không phải lỗi critical
  }
};

// // Hàm lấy thông tin order (sử dụng endpoint có sẵn)
const getOrderInfo = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/orders/id/${orderId}`);
    
    if (!response.ok) {
      throw new Error('Không thể lấy thông tin đơn hàng');
    }
    
    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error getting order info:', error);
    throw error;
  }
};

  // Xử lý thanh toán MoMo
const handleMoMoPayment = async (totalAmount, orderId) => {
  try {
    console.log('Processing VNPAY payment for order:', orderId);

    const paymentData = {
      amount: totalAmount,
      idOrder: orderId, // Truyền orderId từ parameter
      orderInfo: `Thanh toan don hang ${orderId}`,
      language: 'vn'
    };

    const response = await fetch('http://localhost:5000/api/vnpay/create-payment-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('VNPay payment URL created:', result.data.paymentUrl);
      // Clear cart trước khi redirect
      await clearCart();
      // Redirect đến VNPay
      window.location.href = result.data.paymentUrl;
    } else {
      throw new Error(result.message || 'Không thể tạo URL thanh toán VNPay');
    }
  } catch (error) {
    console.error('VNPay payment error:', error);
    throw error;
  }
};

  // Xử lý thanh toán PayPal (placeholder)
  const handlePayPalPayment = async (totalAmount, orderId) => {
  try {
    // 1. Gọi API tạo payment PayPal (POST /api/payments)
    const paymentData = {
      orderId,
      method: "paypal",
      amount: totalAmount
    };

    const response = await fetch('http://localhost:5000/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!result.success || !result.data?.approveUrl) {
      throw new Error(result.message || "Không thể tạo thanh toán PayPal");
    }


    // Redirect sang PayPal để thanh toán
    window.location.href = result.data.approveUrl;
  } catch (error) {
    alert(error.message || "Có lỗi xảy ra khi tạo thanh toán PayPal");
  }
};
  return (
    <div className="payment-wrapper">
      {/* Back button */}
      <button
        className="back-to-cart-btn"
        style={{
          margin: '16px 0',
          padding: '8px 20px',
          fontSize: '16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}
        onClick={() => navigate('/cart')}
      >
        <span style={{fontSize: 20, marginTop: -5}}>&#8592;</span> Quay lại giỏ hàng
      </button>
      <div className="payment-container">
        {/* Cột trái */}
        <div className="payment-left">
          {/* Tài khoản */}

          <PaymentAccount 
            loading={loading}
            error={error}
            userInfo={userInfo}
            getInitials={getInitials}
            fetchUserInfo={fetchUserInfo}
          />


          {/* Thông tin giao hàng */}
          <PaymentDeliveryForm 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            formData={formData}
            onInputChange={handleInputChange}
            onClearField={handleClearField}
            onLocationInputClick={handleLocationInputClick}
            onShowMap={handleShowMap}
          />

          {/* Phương thức giao hàng */}
          <PaymentShippingMethods 
            formData={formData}
            shippingMethods={shippingMethods}
            selectedShippingMethod={selectedShippingMethod}
            onSelectShippingMethod={(value) => setSelectedShippingMethod(value)}
            formatPrice={formatPrice}
          />

          {/* Phương thức thanh toán */}
          <PaymentPaymentMethods 
            paymentMethods={paymentMethods}
            selectedPaymentMethod={selectedPaymentMethod}
            onSelectPaymentMethod={(value) => setSelectedPaymentMethod(value)}
          />
        </div>

        {/* Cột phải */}
        <div className="payment-right">
          {/* Giỏ hàng */}
          <PaymentCart 
            cartLoading={cartLoading}
            cartError={cartError}
            fetchCartItems={fetchCartItems}
            cartItems={cartItems}
            formatPrice={formatPrice}
            decreaseQuantity={decreaseQuantity}
            increaseQuantity={increaseQuantity}
            removeFromCart={removeFromCart}
          />

          <div className="card">
            <h3>Mã khuyến mãi</h3>
            <input
  className="promo-code"
  type="text"
  placeholder="Nhập mã khuyến mãi"
  value={promoCode}
  onChange={e => setPromoCode(e.target.value)}
/>
<button className="apply" onClick={handleApplyPromo}>Áp dụng</button>
{promoError && <div className="promo-error">{promoError}</div>}
{promoDiscount > 0 && <div className="promo-success">Đã áp dụng mã, giảm {formatPrice(promoDiscount)}</div>}
          </div>


          {/* Tóm tắt đơn hàng */}
          <PaymentSummary 
            formatPrice={formatPrice}
            calculateCartTotal={() => calculateCartTotal() - promoDiscount}
            getSelectedShippingPrice={() => formData.location ? getSelectedShippingPrice() : 0}
            hasLocation={!!formData.location}
            handlePlaceOrder={handlePlaceOrder}
            isProcessing={isProcessing}
            selectedPaymentMethod={selectedPaymentMethod}
            cartItems={cartItems}
          />

        </div>
      </div>
    
      {showMap && (
        <MapView 
          initialAddress={
            formData.address && addressParts.province 
              ? `${formData.address}, ${formData.location}`
              : formData.location
          }
          onClose={() => setShowMap(false)}
          onConfirm={handleMapConfirm}
        />
      )}
    </div>
  );
}