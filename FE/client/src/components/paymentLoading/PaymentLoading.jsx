import React from 'react';
import './PaymentLoading.css';

const PaymentLoading = ({ isVisible, paymentMethod = 'momo' }) => {
  if (!isVisible) return null;

  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'momo':
        return 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square-1024x1024.png';
      case 'paypal':
        return 'https://seeklogo.com/images/P/paypal-logo-6ED6A5924E-seeklogo.com.png';
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (paymentMethod) {
      case 'momo':
        return 'Đang khởi tạo thanh toán';
      case 'paypal':
        return 'Đang tạo PayPal payment';
      default:
        return 'Đang xử lý';
    }
  };

  const getSubtitle = () => {
    switch (paymentMethod) {
      case 'momo':
        return 'Vui lòng chờ trong giây lát\nĐang kết nối với MoMo';
      case 'paypal':
        return 'Vui lòng chờ trong giây lát\nĐang kết nối với PayPal';
      default:
        return 'Vui lòng chờ trong giây lát';
    }
  };

  return (
    <div className="payment-loading-overlay">
      <div className="payment-loading-content">
        {getPaymentIcon() && (
          <img 
            src={getPaymentIcon()}
            alt={paymentMethod}
            className="payment-loading-icon"
          />
        )}
        <div className="payment-loading-spinner"></div>
        <div className="payment-loading-title">
          {getTitle()}<span className="loading-dots"></span>
        </div>
        <div className="payment-loading-subtitle">
          {getSubtitle().split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentLoading;