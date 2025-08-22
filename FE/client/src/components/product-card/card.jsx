import './card.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
const handleProductClick = () => {
        // Lưu trang hiện tại trước khi chuyển đến view-product
        sessionStorage.setItem('previousPage', window.location.pathname);
    };
    const handleAddToCart = (e) => {
        e.stopPropagation();
        // Add to cart logic here
        console.log('Added to cart:', product._id);
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        // Wishlist logic here
        console.log('Added to wishlist:', product._id);
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
            {/* Album cover and vinyl record */}
            <div className="album-covers">
                <img 
                    src={getCurrentImageUrl()} 
                    alt="Album Cover" 
                    className={`album-cover left ${hasMultipleImages() ? 'hover-transition' : ''}`}
                />
                {/* Grey bar with heart icon - appears on hover */}
                <div className="grey-bar">
                    <button className="icon-button" onClick={handleWishlist}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
        }}
    />
)}


            {/* Add to cart button - appears on hover */}
            {product.price !== 0 && (
  <button className="add-to-cart-btn1" onClick={handleAddToCart}>
    <div className="btn-text">THÊM VÀO GIỎ </div>
  </button>
)}
        </div>
    );
};

export default ProductCard;