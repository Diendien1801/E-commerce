import React from "react";

export default function PaymentSummary({
  formatPrice,
  calculateCartTotal,
  getSelectedShippingPrice,
  hasLocation,
  handlePlaceOrder,
  isProcessing,
  selectedPaymentMethod,
  cartItems
}) {
  return (
    <div className="card">
      <h3>Tóm tắt đơn hàng</h3>
      <div className="summary-row">
        <span>Tổng tiền hàng</span>
        <span>{formatPrice(calculateCartTotal())}</span>
      </div>
      <div className="summary-row">
        <span>Phí vận chuyển</span>
        <span>{hasLocation ? formatPrice(getSelectedShippingPrice()) : '-'}</span>
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
            {selectedPaymentMethod === 'momo' ? 'Đang tạo thanh toán VNPAY...' : 
             selectedPaymentMethod === 'paypal' ? 'Đang tạo thanh toán PayPal...' : 
             'Đang đặt hàng...'}
          </span>
        ) : (
          <span>
            {selectedPaymentMethod === 'momo' ? 'Thanh toán VNPAY' : 
             selectedPaymentMethod === 'paypal' ? 'Thanh toán PayPal' : 
             'Đặt hàng'}
          </span>
        )}
      </button>
    </div>
  );
}


