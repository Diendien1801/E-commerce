import './card.css';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect  } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import CartPopup from '../popup/popup';
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
   const [isFavorite, setIsFavorite] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { isLoggedIn, user } = useAuth();
    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
const handleProductClick = () => {
        // Lưu trang hiện tại trước khi chuyển đến view-product
        sessionStorage.setItem('previousPage', window.location.pathname);
    };
   const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/cart/${user._id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Thêm vào giỏ thất bại');
      }
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 2000);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert(err.message || 'Có lỗi xảy ra');
    }
  };
// Fetch favorites -> keep heart filled on reload
  useEffect(() => {
    if (!isLoggedIn || !user?._id || !product?._id) {
      setIsFavorite(false);
      return;
    }

    const ctrl = new AbortController();
    const token = localStorage.getItem('token');

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/favorite/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token || ''}` },
            signal: ctrl.signal,
          }
        );
        const json = await res.json().catch(() => ({}));
        // Your API returns: { success, message, data: [ { productID: null | string | object }, ... ] }
        // Normalize to an array of productId strings
        const rawList = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.favorites)
          ? json.favorites
          : Array.isArray(json)
          ? json
          : [];

        const favoriteIds = rawList
          .map((fav) => {
            const pid = fav?.productID;
            if (!pid) return null;
            if (typeof pid === 'string') return pid;
            if (typeof pid === 'object') return pid._id || null; // populated case
            return null;
          })
          .filter(Boolean)
          .map(String);

        setIsFavorite(favoriteIds.includes(String(product._id)));
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Fetch favorites error:', err);
        }
      }
    })();

    return () => ctrl.abort();
  }, [isLoggedIn, user?._id, product?._id]);

    const handleWishlist = async (e) => {
  e.stopPropagation();

  if (!isLoggedIn) {
    alert('Bạn cần đăng nhập để thay đổi danh sách yêu thích');
    return;
  }

  const token = localStorage.getItem('token');

  try {
    if (isFavorite) {
      // --- Remove favorite ---
      const res = await fetch('http://localhost:5000/api/users/favorite', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          userID: user?._id,
          productID: product._id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Xóa yêu thích thất bại');
      }

      setIsFavorite(false);
    } else {
      // --- Add favorite ---
      const res = await fetch('http://localhost:5000/api/users/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          userID: user?._id,
          productID: product._id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || 'Thêm yêu thích thất bại');
      }

      setIsFavorite(true);
    }
  } catch (err) {
    console.error('Wishlist error:', err);
    alert(err.message || 'Có lỗi xảy ra');
  }
};

    
    // Get all available images
    const getImages = () => {
        let images = [];
        
        if (product.imageUrl) {
            if (Array.isArray(product.imageUrl)) {
                images = product.imageUrl;
            } else {
                images = [product.imageUrl];
            }
        } else if (product.images && Array.isArray(product.images)) {
            images = product.images;
        } else if (product.image) {
            images = [product.image];
        }
        
        // Filter out empty or invalid URLs
        images = images.filter(img => img && img.trim() !== '');
        
        if (images.length === 0) {
            images = ['https://via.placeholder.com/200x200?text=No+Image'];
        }
        
        return images;
    };

    // Get current image URL based on hover state
const getCurrentImageUrl = () => {
    const images = getImages();
    
    // Function để chuyển đổi URL ảnh từ compact sang master
    const getMasterImageUrl = (imageUrl) => {
        if (!imageUrl) return imageUrl;
        
        // Chỉ thay đổi khi có _compact. trong URL
        if (imageUrl.includes('_compact.')) {
            return imageUrl.replace('_compact.', '_master.');
        }
        
        // Nếu không có _compact. thì giữ nguyên URL
        return imageUrl;
    };
    
    // If hovering and there's a second image, show it in master quality
    if (isHovered && images.length > 1) {
        return getMasterImageUrl(images[1]);
    }
    
    // Otherwise show first image in master quality
    return getMasterImageUrl(images[0]);
};

    // Check if product has multiple images
    const hasMultipleImages = () => {
        const images = getImages();
        return images.length > 1;
    };

    return (
        
        <><div
        className="product-card"
        onClick={() => navigate(`../view-product/${product._id}`)}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          to={`/view-product/${product._id}`}
          onClick={handleProductClick}
          className="product-card-link"
        ></Link>
        {/* Album cover and vinyl record */}
        <div className="album-covers">
          <img
            src={getCurrentImageUrl()}
            alt="Album Cover"
            className={`album-cover left ${hasMultipleImages() ? 'hover-transition' : ''}`} />
          {/* Grey bar with heart icon - appears on hover */}
          <div className="grey-bar">
            <button className="icon-button" onClick={handleWishlist} aria-label="Yêu thích">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'red' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product info */}
        <div className="product-info">
          <div className="album-title">{product.title || 'FIRST IMPRESSION ON EARTH'}</div>
          {product.price === 0 ? (
            <div className="product-price sold-out-text">Bán hết</div>
          ) : (
            <div className="product-price">{formatPrice(product.price)}₫</div>
          )}
        </div>

        {product.price === 0 && (
          <img
            src="https://theme.hstatic.net/1000304920/1001307865/14/sold-out.png?v=468"
            alt="Sold out"
            className="sold-out-image"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 80,
              height: "auto",
              zIndex: 2,
              pointerEvents: "none",
              userSelect: "none"
            }} />
        )}


        {/* Add to cart button - appears on hover */}
        {product.price !== 0 && (
          <button className="add-to-cart-btn1" onClick={handleAddToCart}>
            <div className="btn-text">THÊM VÀO GIỎ </div>
          </button>
        )}
      </div>
      <CartPopup show={showCartPopup} message="Đã thêm vào giỏ hàng!" /></>  
    );
    
};

export default ProductCard;