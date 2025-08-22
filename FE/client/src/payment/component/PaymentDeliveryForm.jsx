import React from "react";

export default function PaymentDeliveryForm({
  activeTab,
  onTabChange,
  formData,
  onInputChange,
  onClearField,
  onLocationInputClick,
  onShowMap
}) {
  return (
    <div className="card">
      <h3>Thông tin giao hàng</h3>
      <div className="delivery-tabs">
        <button 
          className={`delivery-tab ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => onTabChange('delivery')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM19.5 9.5L21.46 12H17V9.5H19.5ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM8.22 15C7.67 14.39 6.89 14 6 14C5.11 14 4.33 14.39 3.78 15H3V6H15V15H8.22ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z" fill="currentColor" className="!fill-current" aria-hidden="true" focusable="false" tabIndex="-1"></path></svg>
          Giao tận nơi
        </button>
      </div>
      
      {activeTab === 'delivery' && (
        <div className="form-fields">
          <div className="input-group">
            <input 
              type="text" 
              id="fullName"
              value={formData.fullName}
              onChange={(e) => onInputChange('fullName', e.target.value)}
              className="form-input"
              placeholder=" "
            />
            <label htmlFor="fullName" className="form-label">Họ và tên</label>
            {formData.fullName && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => onClearField('fullName')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          <div className="input-group">
            <input 
              type="tel" 
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="form-input"
              placeholder=" "
            />
            <label htmlFor="phone" className="form-label">Số điện thoại</label>
            {formData.phone && (
              <button 
                type="button" 
                className="clear-btn"
                onClick={() => onClearField('phone')}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="country"
              value={formData.country}
              className="form-input"
              readOnly
            />
            <label htmlFor="country" className="form-label">Quốc gia</label>
          </div>

          <div className="input-group">
            <input 
              type="text" 
              id="location"
              value={formData.location}
              placeholder=" "
              className="form-input"
              readOnly
              onClick={onLocationInputClick}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="location" className="form-label">Tỉnh/TP, Quận/Huyện, Phường/Xã</label>
            
            <div className="location-buttons">
              <button 
                type="button" 
                className="map-btn"
                onClick={onShowMap}
                title="Chọn trên bản đồ"
              >
                🗺️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


