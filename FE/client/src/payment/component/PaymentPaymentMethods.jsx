import React from "react";

export default function PaymentPaymentMethods({ paymentMethods, selectedPaymentMethod, onSelectPaymentMethod }) {
  return (
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
              onChange={(e) => onSelectPaymentMethod(e.target.value)}
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
            <p>Quét mã QR hoặc mở ứng dụng Momo để thanh toán</p>
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
  );
}


