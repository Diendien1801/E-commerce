import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './text-pages.css';

const PrivacyPolicy = () => {
  const { i18n } = useTranslation();
  const isVI = i18n.language === 'vi';
  return (
    <>
      <Navbar />
      <div className="text-page-center">
        {isVI ? (
          <>
            <h2><strong>Chính Sách Bảo Mật</strong></h2>
            <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi dữ liệu đều được mã hóa và bảo mật.</p>
            <ul>
              <li>- Không chia sẻ thông tin với bên thứ ba.</li>
              <li>- Khách hàng có quyền yêu cầu chỉnh sửa hoặc xoá thông tin.</li>
              <li>- Liên hệ CSKH nếu có thắc mắc về bảo mật.</li>
            </ul>
          </>
        ) : (
          <>
            <h2><strong>Privacy Policy</strong></h2>
            <p>We are committed to protecting your personal information. All data is encrypted and secured.</p>
            <ul>
              <li>No information is shared with third parties.</li>
              <li>Customers can request to edit or delete their information.</li>
              <li>Contact customer service for any privacy concerns.</li>
            </ul>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
