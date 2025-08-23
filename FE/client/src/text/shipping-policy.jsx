import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const ShippingPolicy = () => {
  const { i18n } = useTranslation();
  const isVI = i18n.language === 'vi';
  return (
    <>
      <Navbar />
      <div className="text-page-center">
        {isVI ? (
          <>
            <h2><strong>Chính Sách Giao Hàng</strong></h2>
            <p>Chúng tôi giao hàng toàn quốc với các phương thức:</p>
            <ul>
              <li>- Giao hàng tiêu chuẩn: 2-5 ngày làm việc</li>
              <li>- Giao hàng nhanh: 1-2 ngày làm việc</li>
              <li>- Giao hàng trong ngày (nội thành HN/HCM)</li>
            </ul>
            <p>Phí vận chuyển sẽ hiển thị khi đặt hàng. Vui lòng kiểm tra kỹ thông tin nhận hàng trước khi xác nhận.</p>
          </>
        ) : (
          <>
            <h2><strong>Shipping Policy</strong></h2>
            <p>We deliver nationwide with the following methods:</p>
            <ul>
              <li>Standard delivery: 2-5 business days</li>
              <li>Express delivery: 1-2 business days</li>
              <li>Same-day delivery (Hanoi/HCMC inner city)</li>
            </ul>
            <p>Shipping fees are shown at checkout. Please verify your delivery information before confirming.</p>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ShippingPolicy;
