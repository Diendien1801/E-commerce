import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './payment-result.css';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        console.log('🔍 Current URL:', window.location.href);
        console.log('🔍 All URL params:', Object.fromEntries(searchParams));
        
        // Lấy tất cả parameters từ URL
        const urlStatus = searchParams.get('status');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        const transactionId = searchParams.get('transactionId');
        const message = searchParams.get('message');
        const resultCode = searchParams.get('resultCode');
        
        console.log('📦 Extracted params:', { 
          urlStatus, 
          orderId, 
          amount, 
          transactionId, 
          message, 
          resultCode 
        });
        
        // Set thông tin order từ URL
        if (orderId && amount) {
          const orderData = {
            orderId: orderId,
            amount: parseInt(amount) , 
            transactionId: transactionId,
            resultCode: resultCode,
            message: message
          };
          
          setOrderInfo(orderData);
          console.log('📄 Order info set:', orderData);
        }
        
        // Xử lý trạng thái dựa trên URL params
        if (urlStatus === 'success') {
          console.log('✅ Payment successful!');
          setStatus('success');
          
          // Gọi API xác nhận thanh toán nếu cần
          if (orderId) {
            try {
              const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/orders/id/${orderId}`);
              if (response.ok) {
                const orderData = await response.json();
                console.log('✅ Order verified:', orderData);
              }
            } catch (error) {
              console.error('Error verifying order:', error);
            }
          }
          
        } else if (urlStatus === 'failed') {
          console.log('❌ Payment failed!');
          setStatus('failed');
          
        } else if (urlStatus === 'error') {
          console.log('⚠️ Payment error!');
          setStatus('error');
          
        } else {
          // Nếu không có status rõ ràng, kiểm tra message
          if (message === 'payment_success') {
            setStatus('success');
          } else if (message === 'payment_failed') {
            setStatus('failed');
          } else {
            console.log('⚠️ Unknown status, defaulting to error');
            setStatus('error');
          }
        }
        
        // Cleanup localStorage
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('paymentResult');
        
      } catch (error) {
        console.error('💥 Error checking payment result:', error);
        setStatus('error');
      }
    };

    // Chỉ chạy nếu có searchParams
    if (searchParams.toString()) {
      checkPaymentResult();
    } else {
      console.log('⚠️ No search params found');
      setStatus('error');
    }
  }, [searchParams]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    navigate('/payment');
  };

  const handleViewOrders = () => {
    navigate('/order');
  };

  if (status === 'loading') {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card">
          <div className="loading-spinner"></div>
          <h2>Đang xử lý kết quả thanh toán...</h2>
          <p>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card success">
          <div className="icon success-icon">✅</div>
          <h2>Thanh toán thành công!</h2>
          <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
          
          {orderInfo && (
            <div className="order-summary">
              <h3>Thông tin đơn hàng</h3>
              <div className="order-detail">
                <span>Mã đơn hàng:</span>
                <span className="highlight">{orderInfo.orderId}</span>
              </div>
              <div className="order-detail">
                <span>Số tiền:</span>
                <span className="highlight">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(orderInfo.amount)}
                </span>
              </div>
              {orderInfo.transactionId && (
                <div className="order-detail">
                  <span>Mã giao dịch:</span>
                  <span className="highlight">{orderInfo.transactionId}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button className="btn primary" onClick={handleViewOrders}>
              Xem đơn hàng
            </button>
            <button className="btn secondary" onClick={handleReturnHome}>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="payment-result-container">
        <div className="payment-result-card failed">
          <div className="icon failed-icon">❌</div>
          <h2>Thanh toán thất bại</h2>
          <p>Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
          
          {orderInfo && (
            <div className="order-summary">
              <div className="order-detail">
                <span>Mã đơn hàng:</span>
                <span>{orderInfo.orderId}</span>
              </div>
              {orderInfo.resultCode && (
                <div className="order-detail">
                  <span>Mã lỗi:</span>
                  <span>{orderInfo.resultCode}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button className="btn primary" onClick={handleRetryPayment}>
              Thử lại thanh toán
            </button>
            <button className="btn secondary" onClick={handleReturnHome}>
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="payment-result-container">
      <div className="payment-result-card error">
        <div className="icon error-icon">⚠️</div>
        <h2>Có lỗi xảy ra</h2>
        <p>Không thể xác định kết quả thanh toán. Vui lòng liên hệ hỗ trợ.</p>
        
        {/* Debug info */}
        <details className="debug-info">
          <summary>Thông tin debug</summary>
          <pre>{JSON.stringify(Object.fromEntries(searchParams), null, 2)}</pre>
        </details>
        
        <div className="action-buttons">
          <button className="btn primary" onClick={handleReturnHome}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;