import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import CartItem from '../components/CartItem';
import Breadcrumb from '../components/breadcrumb/page';
import CartSummary from '../components/CartSummary';
import './cart.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || '6888ecdffb44b885381dd9e2';
      
      const response = await fetch(`http://localhost:5000/api/cart/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.cart.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const userId = localStorage.getItem('userId') || '6888ecdffb44b885381dd9e2';
      
      if (newQuantity <= 0) {
        await fetch(`http://localhost:5000/api/cart/${userId}/remove/${productId}`, {
          method: 'DELETE'
        });
      } else {
        const currentItem = cartItems.find(item => item.productId._id === productId);
        const difference = newQuantity - currentItem.quantity;
        
        if (difference > 0) {
          for (let i = 0; i < difference; i++) {
            await fetch(`http://localhost:5000/api/cart/${userId}/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId })
            });
          }
        } else {
          for (let i = 0; i < Math.abs(difference); i++) {
            await fetch(`http://localhost:5000/api/cart/${userId}/remove/${productId}`, {
              method: 'DELETE'
            });
          }
        }
      }
      
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const userId = localStorage.getItem('userId') || '6888ecdffb44b885381dd9e2';
      const currentItem = cartItems.find(item => item.productId._id === productId);
      
      for (let i = 0; i < currentItem.quantity; i++) {
        await fetch(`http://localhost:5000/api/cart/${userId}/remove/${productId}`, {
          method: 'DELETE'
        });
      }
      
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.quantity * item.priceAtTime);
    }, 0);
  };

  return (
    <div>
      <Navbar />
      <Breadcrumb />
      {/* Main Cart Content */}
      <div className="cart-container">
        {loading ? (
          <div className="cart-loading">
            <p>Đang tải giỏ hàng...</p>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Header */}
            <div className="cart-header">
              <div className="cart-header-item">Sản phẩm</div>
              <div className="cart-header-item">Giá</div>
              <div className="cart-header-item">Số lượng</div>
              <div className="cart-header-item">Tổng tiền</div>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Giỏ hàng của bạn đang trống</p>
                  <a href="/shop" className="continue-shopping">Tiếp tục mua sắm</a>
                </div>
              ) : (
                cartItems.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>

            {/* Cart Notes */}
            {cartItems.length > 0 && (
              <div className="cart-notes">
                <label htmlFor="order-note">Thêm ghi chú cho đơn hàng...</label>
                <textarea
                  id="order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú của bạn"
                  rows="4"
                />
              </div>
            )}

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <CartSummary
                total={calculateTotal()}
                itemCount={cartItems.length}
                note={note}
              />
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;