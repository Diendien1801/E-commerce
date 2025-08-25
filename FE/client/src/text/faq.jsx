import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const FAQ = () => {
  const { i18n } = useTranslation();
  const isVI = i18n.language === 'vi';
  return (
    <>
      <Navbar />
      <div className="text-page-center">
        {isVI ? (
          <>
            <h2><strong>Câu Hỏi Thường Gặp</strong></h2>
            <ul>
              <li><b>Làm sao để đổi trả sản phẩm?</b><br />Liên hệ CSKH qua email hoặc hotline để được hướng dẫn đổi trả.</li>
              <li><b>Làm sao để huỷ đơn hàng?</b><br />Vào mục đơn hàng, chọn huỷ hoặc liên hệ CSKH.</li>
              <li><b>Thời gian giao hàng bao lâu?</b><br />Giao hàng tiêu chuẩn 2-5 ngày, nhanh 1-2 ngày.</li>
              <li><b>Thông tin cá nhân có được bảo mật không?</b><br />Chúng tôi cam kết bảo mật tuyệt đối thông tin khách hàng.</li>
            </ul>
          </>
        ) : (
          <>
            <h2><strong>Frequently Asked Questions</strong></h2>
            <ul>
              <li><b>How do I return a product?</b><br />Contact customer service via email or hotline for return instructions.</li>
              <li><b>How do I cancel an order?</b><br />Go to your orders, select cancel, or contact customer service.</li>
              <li><b>How long does delivery take?</b><br />Standard delivery 2-5 days, express 1-2 days.</li>
              <li><b>Is my personal information secure?</b><br />We guarantee absolute privacy for all customer data.</li>
            </ul>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
