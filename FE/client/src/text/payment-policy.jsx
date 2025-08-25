import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const PaymentPolicy = () => {
  const { i18n } = useTranslation();
  const isVI = i18n.language === 'vi';
  return (
    <>
      <Navbar />
      <div className="text-page-center">
        {isVI ? (
          <>
            <h2><strong>Chính Sách Thanh Toán</strong></h2>
            <p>Chúng tôi cam kết bảo mật thông tin thanh toán của khách hàng. Các giao dịch đều được mã hóa và bảo vệ.</p>
            <ul>
              <li>- Không lưu trữ thông tin thẻ trên hệ thống.</li>
              <li>- Hỗ trợ hoàn tiền theo quy định khi đơn hàng bị huỷ hoặc trả hàng.</li>
              <li>- Liên hệ CSKH nếu có vấn đề về thanh toán.</li>
            </ul>
          </>
        ) : (
          <>
            <h2><strong>Payment Policy</strong></h2>
            <p>We are committed to protecting your payment information. All transactions are encrypted and secured.</p>
            <ul>
              <li>No card information is stored on our system.</li>
              <li>Refunds are supported according to policy for cancelled or returned orders.</li>
              <li>Contact customer service for any payment issues.</li>
            </ul>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentPolicy;
