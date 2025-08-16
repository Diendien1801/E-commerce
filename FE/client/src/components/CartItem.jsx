import "./cart-item.css";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { productId, quantity, priceAtTime } = item;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(productId._id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="cart-item" style={{ display: 'flex', alignItems: 'center', gap: '24px', background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
      <div className="cart-item-product">
        <div className="product-image">
          <img 
            src={productId.imageUrl?.[0] || '/default-image.jpg'} 
            alt={productId.title}
          />
        </div>
        <div className="product-info">
          <h3>{productId.title}</h3>
          <p className="product-category">LTD BOXSET</p>
          <p className="product-label">Hãng Đĩa Thời Đại</p>
          <button 
            className="remove-button"
            onClick={() => onRemove(productId._id)}
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="cart-item-price">
        {formatPrice(priceAtTime)}
      </div>

      <div className="cart-item-quantity">
        <div className="quantity-controls">
          <button 
            className="quantity-btn minus"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            −
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
            min="0"
          />
          <button 
            className="quantity-btn plus"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        {formatPrice(quantity * priceAtTime)}
      </div>
    </div>
  );
};

export default CartItem;