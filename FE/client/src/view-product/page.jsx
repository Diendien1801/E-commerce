import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import { useAuth } from '../components/context/authcontext';
import './view-product.css';

const ViewProduct = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [favLoading, setFavLoading] = useState(false);
    const [favError, setFavError] = useState('');
    const [favSuccess, setFavSuccess] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data));
    }, [id]);

    const handleAddFavorite = async () => {
        setFavLoading(true);
        setFavError('');
        setFavSuccess('');
        const userId = user?._id || user?.userId || user?.id;
        if (!userId) {
            setFavError('You must be logged in to add favorites.');
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
                setFavSuccess('Added to favorites!');
            } else {
                setFavError(data.message || 'Failed to add to favorites');
            }
        } catch {
            setFavError('Server error');
        }
        setFavLoading(false);
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div className="view-product-container">
                <div className="view-product-flex">
                    <div className="view-product-image">
                        <img src={product.imageUrl || 'https://via.placeholder.com/400x400?text=Product'} alt={product.title} />
                    </div>
                    <div className="view-product-info">
                        <h2>{product.title}</h2>
                        <p>{product.description}</p>
                        <button
                            className="favorite-btn"
                            style={{ margin: '0.7rem 0', padding: '0.5rem 1.2rem', background: '#9E3736', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '1rem' }}
                            onClick={handleAddFavorite}
                            disabled={favLoading}
                        >
                            {favLoading ? 'Adding...' : 'Add to favorite'}
                        </button>
                        {favError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{favError}</div>}
                        {favSuccess && <div style={{ color: 'green', marginTop: '0.5rem' }}>{favSuccess}</div>}
                        <div className="view-product-price">${product.price}</div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ViewProduct;
