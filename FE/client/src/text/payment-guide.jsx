import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const PaymentGuide = () => {
  const { i18n } = useTranslation();
  const isVI = i18n.language === 'vi';
  return (
    <>
      <Navbar />
      <div className="text-page-center">
        {isVI ? (
          <>
            <h2><strong>Hướng Dẫn Thanh Toán</strong></h2>
            <p>Bạn có thể thanh toán đơn hàng bằng các phương thức sau:</p>
            <ul>
              <li>- Thanh toán khi nhận hàng (COD)</li>
              <li>- Chuyển khoản ngân hàng</li>
              <li>- Ví điện tử (VNPAY, MoMo)</li>
              <li>- Thẻ tín dụng/ghi nợ</li>
            </ul>
            <p>Vui lòng chọn phương thức phù hợp khi đặt hàng. Nếu cần hỗ trợ, liên hệ bộ phận CSKH.</p>
          </>
        ) : (
          <>
            <h2><strong>Payment Guide</strong></h2>
            <p>You can pay for your order using the following methods:</p>
            <ul>
              <li>Cash on Delivery (COD)</li>
              <li>Bank Transfer</li>
              <li>E-wallets (VNPAY, MoMo)</li>
              <li>Credit/Debit Card</li>
            </ul>
            <p>Please select your preferred payment method when ordering. For support, contact our customer service.</p>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentGuide;
