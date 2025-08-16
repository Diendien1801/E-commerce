import './card.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/authcontext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const handleProductClick = () => {
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
        console.log('Cart updated:', data);
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

  // Click heart -> add to favorites
  // Click heart -> add or remove from favorites
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

  // Images helpers
  const getImages = () => {
    let images = [];

    if (product.imageUrl) {
      images = Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl];
    } else if (Array.isArray(product.images)) {
      images = product.images;
    } else if (product.image) {
      images = [product.image];
    }

    images = images.filter((img) => img && img.trim() !== '');
    if (images.length === 0) images = ['https://via.placeholder.com/200x200?text=No+Image'];
    return images;
  };

  const getCurrentImageUrl = () => {
    const images = getImages();
    const toMaster = (url) => (url?.includes('_compact.') ? url.replace('_compact.', '_master.') : url);
    if (isHovered && images.length > 1) return toMaster(images[1]);
    return toMaster(images[0]);
  };

  const hasMultipleImages = () => getImages().length > 1;

  return (
    <div
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

      <div className="album-covers">
        <img
          src={getCurrentImageUrl()}
          alt={product?.title || 'Album Cover'}
          className={`album-cover left ${hasMultipleImages() ? 'hover-transition' : ''}`}
        />
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

      <div className="product-info">
        <div className="album-title">{product.title || 'FIRST IMPRESSION ON EARTH'}</div>
        <div className="product-price">{formatPrice(product.price)}₫</div>
      </div>

      <button className="add-to-cart-btn1" onClick={handleAddToCart}>
        <div className="btn-text">THÊM VÀO GIỎ</div>
      </button>
    </div>
  );
};

export default ProductCard;