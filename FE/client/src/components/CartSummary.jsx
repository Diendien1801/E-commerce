import React from 'react';

const CartSummary = ({ total, itemCount, note }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleCheckout = () => {
    // Navigate to checkout or handle checkout logic
    console.log('Proceeding to checkout with:', { total, itemCount, note });
    // You can use navigate here: navigate('/checkout')
  };

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
        <button className="btn-checkout" onClick={handleCheckout}>
          THANH TOÁN
        </button>
      </div>
    </div>
  );
};

export default CartSummary;