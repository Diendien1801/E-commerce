import React from "react";

export default function PaymentAccount({ loading, error, userInfo, getInitials, fetchUserInfo }) {
  return (
    <div className="card">
      <h3>Tài khoản</h3>
      {loading ? (
        <div className="account-info">
          <div className="avatar">...</div>
          <div>
            <p className="name">Đang tải...</p>
            <p className="small">Đang lấy thông tin tài khoản</p>
          </div>
        </div>
      ) : error ? (
        <div className="account-info">
          <div className="avatar">!</div>
          <div>
            <p className="name">Lỗi</p>
            <p className="small" style={{color: 'red'}}>{error}</p>
          </div>
          <button className="logout" onClick={fetchUserInfo}>Thử lại</button>
        </div>
      ) : userInfo ? (
        <div className="account-info">
          <div className="avatar">{getInitials(userInfo.name || userInfo.fullName)}</div>
          <div>
            <p className="name">{userInfo.name || userInfo.fullName || 'Người dùng'}</p>
            <p className="small">
              {userInfo.email || userInfo.gmail || 'Chưa có email'} | {userInfo.phone || userInfo.phoneNumber || 'Chưa có SĐT'}
            </p>
          </div>
        </div>
      ) : (
        <div className="account-info">
          <div className="avatar">?</div>
          <div>
            <p className="name">Chưa có thông tin</p>
            <p className="small">Không thể lấy thông tin tài khoản</p>
          </div>
        </div>
      )}
    </div>
  );
}


