import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ total, itemCount, note }) => {
  const navigate = useNavigate();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with:', { total, itemCount, note });
    navigate('/payment');
  };

  const handleUpdate = () => {
    // Handle cart update logic
    window.location.reload(); 
  };

  return (
    <div className="cart-summary">
      <div className="summary-info">
        <p className="shipping-note">Phí vận chuyển áp dụng khi thanh toán</p>
        <div className="total-amount">
          <span>Tổng tiền: </span>
          <span className="total-price">{formatPrice(total)}</span>
        </div>
      </div>
      
      <div className="checkout-buttons">
        <button className="btn-update" onClick={handleUpdate}>
          CẬP NHẬT
        </button>
        <button className="btn-checkout" onClick={handleCheckout}>
          THANH TOÁN
        </button>
      </div>
    </div>
  );
};

export default CartSummary;