import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import './view-product.css';

const ViewProduct = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data));
    }, [id]);

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
                        <div className="view-product-price">${product.price}</div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ViewProduct;
