import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './detail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedPrice, setEditedPrice] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                const prod = data.data;
                if (!prod || prod.status === 'deleted') {
                    setProduct(null);
                } else {
                    setProduct(prod);
                    setEditedTitle(prod.title);
                    setEditedDescription(prod.description);
                    setEditedPrice(prod.price || '');
                }
            })
            .catch(() => setProduct(null));
    }, [id]);

    const handleEdit = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        const updatedProduct = {
            ...product,
            title: editedTitle,
            description: editedDescription,
            price: parseFloat(editedPrice),
        };

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            const data = await response.json();
            setProduct(data.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                navigate('/not-found');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Product not found</div>;

    return (
        <div>
            <Navbar />
            <div className="view-product-container">
                <div className="view-product-flex">
                    <div className="view-product-image">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/400x400?text=Product'}
                            alt={product.title}
                        />
                    </div>
                    <div className="view-product-info">
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    style={{ fontSize: 24, marginBottom: 8 }}
                                />
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    style={{ fontSize: 16, width: '100%', height: 100, marginBottom: 8 }}
                                />
                                <input
                                    type="number"
                                    value={editedPrice}
                                    onChange={(e) => setEditedPrice(e.target.value)}
                                    placeholder="Price"
                                    style={{ fontSize: 16, width: '100%', marginBottom: 8 }}
                                />
                            </>
                        ) : (
                            <>
                                <h2>{product.title}</h2>
                                <p>{product.description}</p>
                                <p><strong>Price:</strong> ${product.price}</p>
                            </>
                        )}

                        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleEdit}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                {isEditing ? 'Save' : 'Edit'}
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetail;
