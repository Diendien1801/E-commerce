import React from "react";

export default function PaymentCart({
  cartLoading,
  cartError,
  fetchCartItems,
  cartItems,
  formatPrice,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart
}) {
  return (
    <div className="card">
      <h3>Giỏ hàng</h3>
      {cartLoading ? (
        <div className="cart-loading">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Đang tải giỏ hàng...</p>
          </div>
        </div>
      ) : cartError ? (
        <div className="cart-error">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{color: 'red', marginBottom: '10px'}}>{cartError}</p>
            <button 
              onClick={fetchCartItems}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e91e63',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="cart-empty">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛒</div>
            <p style={{ color: '#666', marginBottom: '10px' }}>Giỏ hàng trống</p>
            <p style={{ color: '#999', fontSize: '14px' }}>Thêm sản phẩm vào giỏ hàng để tiếp tục thanh toán</p>
          </div>
        </div>
      ) : (
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={item._id || item.id || index} className="cart-item">
              <img 
                src={item.productId?.imageUrl[0] || '/placeholder.jpg'} 
                alt={item.productId?.title || 'Product'}
                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
              />
              <div className="cart-item-info">
                <p className="item-name">{item.productId?.title || 'Tên sản phẩm'}</p>
                <p className="price">{formatPrice(item.productId?.price || item.price || 0)}</p>
              </div>
              <div className="quantity">
                <button 
                  className="quantity-btn decrease"
                  onClick={() => decreaseQuantity(item.productId?._id || item.productId)}
                  disabled={item.quantity <= 0}
                  title={item.quantity === 1 ? "Xóa sản phẩm" : "Giảm số lượng"}
                >
                  -
                </button>
                <span className="quantity-display">{item.quantity || 1}</span>
                <button 
                  className="quantity-btn increase"
                  onClick={() => increaseQuantity(item.productId?._id || item.productId)}
                  title="Tăng số lượng"
                >
                  +
                </button>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.productId?._id || item.productId)}
                  title="Xóa sản phẩm khỏi giỏ hàng"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


