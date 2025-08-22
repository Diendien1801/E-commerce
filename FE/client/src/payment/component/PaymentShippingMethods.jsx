import React from "react";

export default function PaymentShippingMethods({ formData, shippingMethods, selectedShippingMethod, onSelectShippingMethod, formatPrice }) {
  return (
    <div className="card">
      <h3>Phương thức giao hàng</h3>
      {!formData.location ? (
        <div className="shipping-placeholder">
          <div className="placeholder-icon">📍</div>
          <p>Vui lòng nhập địa chỉ để xem các phương thức giao hàng</p>
        </div>
      ) : (
        <div className="shipping-methods">
          <div className="shipping-location">
            <span className="location-icon">📍</span>
            <span className="location-text">Giao đến: {formData.location}</span>
          </div>
          {shippingMethods.map(method => (
            <label key={method.id} className={`shipping-option ${selectedShippingMethod === method.id ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="shipping" 
                value={method.id}
                checked={selectedShippingMethod === method.id}
                onChange={(e) => onSelectShippingMethod(e.target.value)}
              />
              <div className="shipping-content">
                <div className="shipping-left">
                  <span className="shipping-icon">{method.icon}</span>
                  <div className="shipping-info">
                    <div className="shipping-name">
                      {method.name}
                      {method.recommended && <span className="recommended-badge">Khuyến nghị</span>}
                    </div>
                    <div className="shipping-description">{method.description}</div>
                  </div>
                </div>
                <div className="shipping-price">{formatPrice(method.price)}</div>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}


