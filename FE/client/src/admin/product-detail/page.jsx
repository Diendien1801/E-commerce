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
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');


    useEffect(() => {
        fetch(`http://localhost:5000/api/products/admin/${id}`)
            .then(res => res.json())
            .then(data => {
                const prod = data.data;
                if (!prod) {
                    setProduct(null);
                } else {
                    setProduct(prod);
                    setEditedTitle(prod.title);
                    setEditedDescription(prod.description);
                    setEditedPrice(prod.price || '');
                }
                const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/categories/hierarchy');
                const result = await res.json();
                const flatChildren = [];

                const extractChildren = (nodes) => {
                for (let node of nodes) {
                    if (node.children && node.children.length > 0) {
                    flatChildren.push(...node.children);
                    }
                }
                };

                extractChildren(result.data || []);
                setCategories(flatChildren);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
            };

            fetchCategories();

            setSelectedCategory(prod.idCategory || '');
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
            categoryId: selectedCategory
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
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                console.log('Product deleted successfully');
            }
        } catch (error) {
            console.error('Delete failed:', error);
    }};

    const handleRestore = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}/restore`, {
            method: 'POST',
            });

            const data = await response.json();
            if (data.success) {
            setProduct({ ...product, isDeleted: false }); 
            }
        } catch (error) {
            console.error('Restore failed:', error);
    }};

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
                                <div className="edit-form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    style={{ fontSize: 24, marginBottom: 8 }}
                                />
                                </div>
                                <div className="edit-form-group">
                                <label>Description</label>
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    style={{ fontSize: 16, width: '100%', height: 100, marginBottom: 8 }}
                                />
                                </div>
                                <div className="edit-form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    value={editedPrice}
                                    onChange={(e) => setEditedPrice(e.target.value)}
                                    placeholder="Price"
                                    style={{ fontSize: 16, width: '100%', marginBottom: 8 }}
                                />
                                </div>
                                <div className="edit-form-group">
                                <label>Category</label>
                                <div className="custom-select-wrapper">
                                <select
                                    className="custom-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                    <option key={cat.idCategory} value={cat.idCategory}>
                                        {cat.name}
                                    </option>
                                    ))}
                                </select>
                                <span className="arrow">&#9662;</span>
                                </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2>{product.title}</h2>
                                <p>{product.description}</p>
                                <p><strong>Price:</strong> ${product.price}</p>
                                <p><strong>Category:</strong> {categories.find(cat => cat.idCategory === product.idCategory)?.name || 'N/A'}</p>
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
                                }}>
                                {isEditing ? 'Save' : 'Edit'}
                            </button>
                            {product.isDeleted ? (
                            <button
                                onClick={handleRestore}
                                style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                }}>
                                Restore
                            </button>
                            ) : (
                            <button
                                onClick={handleDelete}
                                style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                }}>
                                Delete
                            </button>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetail;
