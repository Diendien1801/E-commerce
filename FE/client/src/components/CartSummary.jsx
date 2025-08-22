import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartSummary = ({ total, itemCount, note }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const navigate = useNavigate();

  const handleUpdate = () => {
    // Handle cart update logic
    window.location.reload(); // Simple refresh for now
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
        <button className="btn-checkout" onClick={() => navigate('/payment')}>
          THANH TOÁN
        </button>
      </div>
    </div>
  );
};

export default CartSummary;