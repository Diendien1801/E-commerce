import './card.css';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <div className="product-card" onClick={() => navigate(`../view-product/${product._id}`)} style={{ cursor: 'pointer' }}>
            <img src={product.imageUrl[0] || 'https://via.placeholder.com/160x160?text=Product'} alt={product.name} />
            <div className="product-name">{product.title}</div>
            <div className="product-price">{formatPrice(product.price)} VND</div>
        </div>
    );
};

export default ProductCard;
