import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import Breadcrumb from '../components/breadcrumb/page'; // Import Breadcrumb
import  CartPopup from '../components/popup/popup';  
import ProductCard from '../components/product-card/card'; // Import ProductCard
import { useAuth } from '../components/context/authcontext';
import './view-product.css';
import { useCart } from '../components/cart/CartContext';
import YouTubePreview from '../components/YouTubePreview';
const ViewProduct = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]); // Thêm state cho related products
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [favLoading, setFavLoading] = useState(false);
    const [favError, setFavError] = useState('');
    const [favSuccess, setFavSuccess] = useState('');
    const { user } = useAuth();
     const { addToCart } = useCart();
      const [showCartPopup, setShowCartPopup] = useState(false);

    useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(data => setProduct(data.data));
}, [id]);
const getSongName = (title) => {
  if (!title) return "";
  const parts = title.split("-");
  let artist = parts.length >= 1 ? parts[0].trim() : "";
  let song = parts.length >= 2 ? parts[1].trim() : title.trim();
 
  song = song.replace(/\(.*?\)/g, "").trim();
 
  return artist && song ? `${artist} ${song}` : song;
};
// Fetch related products khi product đã load
useEffect(() => {
    const fetchRelatedProducts = async () => {
        if (product && product.related && product.related.length > 0) {
            try {
                console.log('Related IDs:', product.related);
                
                // Fetch tất cả related products cùng lúc
                const relatedPromises = product.related.map(relatedId => 
                    fetch(`http://localhost:5000/api/products/${relatedId}`)
                        .then(res => res.json())
                        .then(data => data.data)
                        .catch(error => {
                            console.log(`Error fetching product ${relatedId}:`, error);
                            return null;
                        })
                );
                
                const relatedData = await Promise.all(relatedPromises);
                
                // Filter out null values (failed requests)
                const validRelatedProducts = relatedData.filter(item => item !== null);
                
                console.log('Fetched related products:', validRelatedProducts);
                setRelatedProducts(validRelatedProducts);
                
            } catch (error) {
                console.log('Error fetching related products:', error);
                setRelatedProducts([]);
            }
        }
    };

    fetchRelatedProducts();
}, [product]);
    const scrollRelated = (direction) => {
    const container = document.getElementById('relatedProductsContainer');
    if (container) {
        const scrollAmount = 320; // Width of one card + gap
        
        if (direction === 'left') {
            container.scrollLeft -= scrollAmount;
        } else {
            container.scrollLeft += scrollAmount;
        }
    }
};
    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleAddFavorite = async () => {
        setFavLoading(true);
        setFavError('');
        setFavSuccess('');
        const userId = user?._id || user?.userId || user?.id;
        if (!userId) {
            setFavError(t('mustLoginToFavorite', 'You must be logged in to add favorites.'));
            setFavLoading(false);
            return;
        }
        try {
            const res = await fetch('http://localhost:5000/api/users/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userID: userId, productID: id })
            });
            const data = await res.json();
            if (res.ok && data.success !== false) {
                setFavSuccess(t('addedToFavorites', 'Added to favorites!'));
            } else {
                setFavError(data.message || t('failedToAddFavorite', 'Failed to add to favorites'));
            }
        } catch {
            setFavError(t('serverError', 'Server error'));
        }
        setFavLoading(false);
    };

   if (!product) return <div className="loading">{t('loading', 'Loading...')}</div>;

    const productImages = Array.isArray(product.imageUrl) 
        ? [...product.imageUrl].filter(img => img && img.trim() !== '')
        : product.imageUrl 
            ? [product.imageUrl].filter(img => img && img.trim() !== '')
            : [];

    // Thêm ảnh placeholder nếu không có ảnh nào
    if (productImages.length === 0) {
        productImages.push("https://via.placeholder.com/400x400?text=No+Image");
    }

    // Function để chuyển đổi URL ảnh từ compact sang master
    const getMainImageUrl = (imageUrl) => {
        if (!imageUrl) return imageUrl;
        
        // Chỉ thay đổi khi có _compact. trong URL
        if (imageUrl.includes('_compact.')) {
            return imageUrl.replace('_compact.', '_master.');
        }
        
        // Nếu không có _compact. thì giữ nguyên URL
        return imageUrl;
    };

    // Function để giữ nguyên URL cho thumbnails (compact)
    const getThumbnailUrl = (imageUrl) => {
        return imageUrl; // Giữ nguyên compact cho thumbnails
    };

    return (
        <div>
            <Navbar />
            <Breadcrumb />
            <div className="product-detail-container">
                <div className="product-detail-content">
                   {/* Left side - Images */}
                   <div className="product-images-section">
                        <div className="main-image">
                            <img 
                                src={getMainImageUrl(productImages[selectedImage])} 
                                alt={product.title}
                                className="main-product-image"
                            />
                        </div>
                        
                        <div className="thumbnails-container">
                            {/* Mũi tên lên */}
                            <button 
                                className="thumbnail-nav-btn up" 
                                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                        d="M18 15L12 9L6 15" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            
                            <div className="image-thumbnails">
                                {productImages.map((image, index) => (
                                    <div 
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img 
                                            src={getThumbnailUrl(image)} 
                                            alt={`${product.title} ${index + 1}`} 
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Mũi tên xuống */}
                            <button 
                                className="thumbnail-nav-btn down" 
                                onClick={() => setSelectedImage(prev => prev < productImages.length - 1 ? prev + 1 : 0)}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                        d="M6 9L12 15L18 9" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Right side - Product Info */}
                    <div className="product-info-section">
                        <div className="product-title">{product.title}</div>
                        
                        <div className="product-meta">
                            <div className="product-status">
                                <span className="label">Tình trạng:</span>
                                <span className="value">Còn hàng</span>
                            </div>
                            <div className="product-origin">
                                <span className="label">Xuất xứ:</span>
                                <span className="value">Còn hàng</span>
                            </div>
                            <div className="product-brand">
                                <span className="label">Thương hiệu:</span>
                                <span className="value">Hãng Đĩa Rung Rinh</span>
                            </div>
                        </div>
                            
                        <div className="current-price">
  {product.price === 0 ? (
    <span className="sold-out-text">Hết hàng</span>
  ) : (
    `${formatPrice(product.price)}₫`
  )}
</div>

                        
                            
                        <div className="quantity-section">
                            <div className="quantity-label">Số lượng:</div>
                            <div className="quantity-controls">
                                <button 
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    min="1"
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="qty-input"
                                />
                                <button 
                                    className="qty-btn"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                                
                        <div className="action-buttons">
                            <button 
                                className="add-to-cart-btn" 
                                onClick={async () => {
                                    if (!user || !user._id) {
                                        alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
                                        return;
                                    }
                                    try {
                                        await addToCart(id, quantity);  
                                        setShowCartPopup(true);
                                        setTimeout(() => setShowCartPopup(false), 2000);
                                    } catch (err) {
                                        alert('Thêm vào giỏ hàng thất bại!');
                                    }
                                }}
                            >
                                THÊM VÀO GIỎ
                            </button>
                            <CartPopup show={showCartPopup} message="Đã thêm vào giỏ hàng!" />
                        </div>

                       

                        {favError && <div className="error-message">{favError}</div>}
                        {favSuccess && <div className="success-message">{favSuccess}</div>}
                    </div>
                </div>
               
                {/* Product Details Tabs */}
                <div className="product-details-tabs">
                    <div className="tab-navigation">
                        <button 
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            MÔ TẢ SẢN PHẨM
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('policy')}
                        >
                            CHÍNH SÁCH ĐỔI TRẢ
                        </button>
                    </div>
                    
                    <div className="tab-content">
                        {activeTab === 'description' ? (
                            <div className="description-content">
                                <div className="product-info">
                                    <p>{product.description}</p>
                                     <YouTubePreview songName={getSongName(product.title)} />  
                                </div>
                                
                               

                                <div className="international-order">
                                    <div className="info-icon">ℹ</div>
                                    <p>For international order, please visit: <a href="https://www.hangdiathoidai.com/international-orders" target="_blank" rel="noopener noreferrer">https://www.hangdiathoidai.com/international-orders</a> for more details.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="policy-content">
                                <h3>Chính sách đổi trả</h3>
                                <div className="policy-section">
                                    <h4>Điều kiện đổi trả:</h4>
                                    <ul>
                                        <li>Sản phẩm còn nguyên vẹn, chưa sử dụng</li>
                                        <li>Đổi trả trong vòng 7 ngày kể từ ngày mua</li>
                                        <li>Có hóa đơn mua hàng</li>
                                        <li>Sản phẩm còn đầy đủ bao bì, phụ kiện</li>
                                    </ul>
                                </div>
                                <div className="policy-section">
                                    <h4>Quy trình đổi trả:</h4>
                                    <ol>
                                        <li>Liên hệ hotline: 0903088038</li>
                                        <li>Cung cấp thông tin đơn hàng</li>
                                        <li>Gửi sản phẩm về địa chỉ công ty</li>
                                        <li>Nhận sản phẩm mới hoặc hoàn tiền</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <div className="section-header">
                        <h2 className="section-title">SẢN PHẨM LIÊN QUAN</h2>
                        <div className="navigation-arrows">
                            <button className="nav-arrow prev" onClick={() => scrollRelated('left')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <button className="nav-arrow next" onClick={() => scrollRelated('right')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="related-products-container" id="relatedProductsContainer">
                        <div className="related-products-grid">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard 
                                    key={relatedProduct._id} 
                                    product={relatedProduct} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
            <Footer />
        </div>
    );
}

export default ViewProduct;