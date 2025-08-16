import "./payment.css";
import React, { useState, useEffect } from "react";
import { useAuth } from '../components/context/authcontext';
// import LocationSelector from "../components/locationSelector/LocationSelector";
import MapView from "../components/map/MapView"

export default function Payment() {
  const { user: loggedInUser } = useAuth();
  const [activeTab, setActiveTab] = useState('delivery');
  // const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showMap, setShowMap] = useState(false);
  // const [selectedLocation, setSelectedLocation] = useState('');

  const [inputRect, setInputRect] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  
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
      
      // Xử lý response structure dựa trên format: { success: true, data: { cart: { items: [] } } }
      if (data.success && data.data && data.data.cart) {
        setCartItems(data.data.cart.items || []);
      } else if (data.success && data.data && Array.isArray(data.data)) {
        setCartItems(data.data);
      } else if (Array.isArray(data)) {
        setCartItems(data);
      } else if (data.items) {
        setCartItems(data.items);
      } else {
        setCartItems([]);
      }
      
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

  // Tính tổng tiền giỏ hàng
  const calculateCartTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
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
      id: 'momo',
      name: 'Ví MoMo',
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
    const totalAmount = cartTotal + shippingCost;

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

    // Debug: Log toàn bộ orderData trước khi gửi
    console.log('=== Order Data Before Send ===');
    console.log('Full orderData:', JSON.stringify(orderData, null, 2));
    console.log('idOrder field:', orderData.idOrder);
    console.log('typeof idOrder:', typeof orderData.idOrder);
    console.log('idOrder length:', orderData.idOrder?.length);

    // Kiểm tra xem có thiếu field nào không
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
    if (selectedPaymentMethod === 'momo') {
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
        window.location.href = `/order-success?orderId=${orderId}`;
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
const handleMoMoPayment = async (totalAmount,orderId) => {
  try {
    console.log('Processing VNPay payment for order:', orderId);

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
  const handlePayPalPayment = async (totalAmount) => {
    alert('Tính năng thanh toán PayPal đang được phát triển');
  };
  return (
    <div className="payment-wrapper">
      <div className="payment-container">
        {/* Cột trái */}
        <div className="payment-left">
          {/* Tài khoản */}
          <div className="card">
            <h3>Tài khoản</h3>
            {loading ? (
              <div className="account-info">
                <div className="avatar">...</div>
                <div>
                  <p className="name">Đang tải...</p>
                  <p className="small">Đang lấy thông tin tài khoản</p>
                </div>
              </div>
            ) : error ? (
              <div className="account-info">
                <div className="avatar">!</div>
                <div>
                  <p className="name">Lỗi</p>
                  <p className="small" style={{color: 'red'}}>{error}</p>
                </div>
                <button className="logout" onClick={fetchUserInfo}>Thử lại</button>
              </div>
            ) : userInfo ? (
              <div className="account-info">
                <div className="avatar">
                  <img 
                    src={userInfo.avatar || '/avatar-default.svg'} 
                    alt={userInfo.name || userInfo.fullName || 'Avatar'} 
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p className="name">{userInfo.name || userInfo.fullName || 'Người dùng'}</p>
                  <p className="small">
                    {userInfo.email || userInfo.gmail || 'Chưa có email'} | {userInfo.phone || userInfo.phoneNumber || 'Chưa có SĐT'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="account-info">
                <div className="avatar">?</div>
                <div>
                  <p className="name">Chưa có thông tin</p>
                  <p className="small">Không thể lấy thông tin tài khoản</p>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin giao hàng */}
          <div className="card">
            <h3>Thông tin giao hàng</h3>
            <div className="delivery-tabs">
              <button 
                className={`delivery-tab ${activeTab === 'delivery' ? 'active' : ''}`}
                onClick={() => handleTabChange('delivery')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM19.5 9.5L21.46 12H17V9.5H19.5ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM8.22 15C7.67 14.39 6.89 14 6 14C5.11 14 4.33 14.39 3.78 15H3V6H15V15H8.22ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z" fill="currentColor" className="!fill-current" aria-hidden="true" focusable="false" tabIndex="-1"></path></svg>
                Giao tận nơi
              </button>
            </div>
            
            {activeTab === 'delivery' && (
              <div className="form-fields">
                <div className="input-group">
                  <input 
                    type="text" 
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="form-input"
                    placeholder=" "
                  />
                  <label htmlFor="fullName" className="form-label">Họ và tên</label>
                  {formData.fullName && (
                    <button 
                      type="button" 
                      className="clear-btn"
                      onClick={() => handleClearField('fullName')}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <input 
                    type="tel" 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                    placeholder=" "
                  />
                  <label htmlFor="phone" className="form-label">Số điện thoại</label>
                  {formData.phone && (
                    <button 
                      type="button" 
                      className="clear-btn"
                      onClick={() => handleClearField('phone')}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <input 
                    type="text" 
                    id="country"
                    value={formData.country}
                    className="form-input"
                    readOnly
                  />
                  <label htmlFor="country" className="form-label">Quốc gia</label>
                </div>

                <div className="input-group">
                  <input 
                    type="text" 
                    id="location"
                    value={formData.location}
                    placeholder=" "
                    className="form-input"
                    readOnly
                    onClick={handleLocationInputClick}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="location" className="form-label">Tỉnh/TP, Quận/Huyện, Phường/Xã</label>
                  
                  <div className="location-buttons">
                    {/* ✅ Thêm nút map */}
                    <button 
                      type="button" 
                      className="map-btn"
                      onClick={handleShowMap}
                      title="Chọn trên bản đồ"
                    >
                      🗺️
                    </button>
                    
                    
                  </div>
                </div>
                
                

                
              </div>
            )}
          </div>

          {/* Phương thức giao hàng */}
          <div className="card">
            <h3>Phương thức giao hàng</h3>
            {!formData.location ? (
              <div className="shipping-placeholder">
                <div className="placeholder-icon">📍</div>
                <p>Vui lòng nhập địa chỉ để xem các phương thức giao hàng</p>
              </div>
            ) : (
              <div className="shipping-methods">
                <div className="shipping-location">
                  <span className="location-icon">📍</span>
                  <span className="location-text">Giao đến: {formData.location}</span>
                </div>
                
                {shippingMethods.map(method => (
                  <label key={method.id} className={`shipping-option ${selectedShippingMethod === method.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      value={method.id}
                      checked={selectedShippingMethod === method.id}
                      onChange={(e) => setSelectedShippingMethod(e.target.value)}
                    />
                    <div className="shipping-content">
                      <div className="shipping-left">
                        <span className="shipping-icon">{method.icon}</span>
                        <div className="shipping-info">
                          <div className="shipping-name">
                            {method.name}
                            {method.recommended && <span className="recommended-badge">Khuyến nghị</span>}
                          </div>
                          <div className="shipping-description">{method.description}</div>
                        </div>
                      </div>
                      <div className="shipping-price">{formatPrice(method.price)}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div className="card">
            <h3>Phương thức thanh toán</h3>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <label 
                  key={method.id} 
                  className={`payment-method-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <div className="payment-icon">
                      <img src={method.icon} alt={method.name} />
                    </div>
                    <div className="payment-info">
                      <div className="payment-name">{method.name}</div>
                      <div className="payment-description">{method.description}</div>
                    </div>
                    <div className="payment-radio">
                      <div className="radio-circle"></div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            {selectedPaymentMethod === 'paypal' && (
              <div className="payment-extra-info">
                <div className="paypal-info">
                  <p>Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán</p>
                </div>
              </div>
            )}
            
            {selectedPaymentMethod === 'momo' && (
              <div className="payment-extra-info">
                <div className="momo-info">
                  <p>Quét mã QR hoặc mở ứng dụng MoMo để thanh toán</p>
                </div>
              </div>
            )}
            
            {selectedPaymentMethod === 'cod' && (
              <div className="payment-extra-info">
                <div className="cod-info">
                  <div className="cod-notice">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1.33333C4.32 1.33333 1.33333 4.32 1.33333 8C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8C14.6667 4.32 11.68 1.33333 8 1.33333ZM8.66667 11.3333H7.33333V10H8.66667V11.3333ZM8.66667 8.66667H7.33333V4.66667H8.66667V8.66667Z" fill="#ff6b35"/>
                    </svg>
                    <span>Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải */}
        <div className="payment-right">
          {/* Giỏ hàng */}
          <div className="card">
            <h3>Giỏ hàng</h3>
            {cartLoading ? (
              <div className="cart-loading">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p>Đang tải giỏ hàng...</p>
                </div>
              </div>
            ) : cartError ? (
              <div className="cart-error">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{color: 'red', marginBottom: '10px'}}>{cartError}</p>
                  <button 
                    onClick={fetchCartItems}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e91e63',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="cart-empty">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
                  <p style={{ color: '#666', marginBottom: '10px' }}>Giỏ hàng trống</p>
                  <p style={{ color: '#999', fontSize: '14px' }}>Thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán</p>
                </div>
              </div>
            ) : (
              <div className="cart-items">
  {cartItems.map((item, index) => (
    <div key={item._id || item.id || index} className="cart-item">
      <img 
        src={item.productId?.imageUrl[0] || '/placeholder.jpg'} 
        alt={item.productId?.title || 'Product'}
        onError={(e) => {
          e.target.src = '/placeholder.jpg';
        }}
      />
      <div className="cart-item-info">
        <p className="item-name">{item.productId?.title || 'Tên sản phẩm'}</p>
        <p className="price">{formatPrice(item.productId?.price || item.price || 0)}</p>
      </div>
      <div className="quantity">
        <button 
          className="quantity-btn decrease"
          onClick={() => decreaseQuantity(item.productId?._id || item.productId)}
          disabled={item.quantity <= 0}
          title={item.quantity === 1 ? "Xóa sản phẩm" : "Giảm số lượng"}
        >
          -
        </button>
        <span className="quantity-display">{item.quantity || 1}</span>
        <button 
          className="quantity-btn increase"
          onClick={() => increaseQuantity(item.productId?._id || item.productId)}
          title="Tăng số lượng"
        >
          +
        </button>
        {/* Nút xóa sản phẩm */}
        <button 
          className="remove-btn"
          onClick={() => removeFromCart(item.productId?._id || item.productId)}
          title="Xóa sản phẩm khỏi giỏ hàng"
        >
          🗑️
        </button>
      </div>
    </div>
  ))}
</div>
            )}
          </div>

          <div className="card">
            <h3>Mã khuyến mãi</h3>
            <input className="promo-code" type="text" placeholder="Nhập mã khuyến mãi" />
            <button className="apply">Áp dụng</button>
          </div>

          <div className="card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tổng tiền hàng</span>
              <span>{formatPrice(calculateCartTotal())}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>{formData.location ? formatPrice(getSelectedShippingPrice()) : '-'}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(calculateCartTotal() + getSelectedShippingPrice())}</span>
            </div>
            <button 
              className="order-btn" 
              onClick={handlePlaceOrder}
              disabled={isProcessing || cartItems.length === 0}
            >
              {isProcessing ? (
                <span>
                  {selectedPaymentMethod === 'momo' ? 'Đang tạo thanh toán MoMo...' : 
                   selectedPaymentMethod === 'paypal' ? 'Đang tạo thanh toán PayPal...' : 
                   'Đang đặt hàng...'}
                </span>
              ) : (
                <span>
                  {selectedPaymentMethod === 'momo' ? 'Thanh toán MoMo' : 
                   selectedPaymentMethod === 'paypal' ? 'Thanh toán PayPal' : 
                   'Đặt hàng'}
                </span>
              )}
            </button>
          </div>
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