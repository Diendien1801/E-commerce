import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './detail.css';

const ProductDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [editedQuantity, setEditedQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editedImages, setEditedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
          setEditedQuantity(prod.quantity || '');
          setEditedPrice(prod.price || '');
          setSelectedCategory(prod.idCategory || '');
          setEditedImages(Array.isArray(prod.imageUrl) ? prod.imageUrl : []);
        }
        fetchCategories();
      })
      .catch(() => setProduct(null));
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories/hierarchy');
      const result = await res.json();
      const flatChildren = [];
      const extractChildren = (nodes) => {
        for (let node of nodes) {
          if (node.children?.length) {
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

  const handleFileUpload = async (files) => {
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dumv5xryl/image/upload';
    const UPLOAD_PRESET = 'RungRing';
    setLoading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      try {
        const cloudRes = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
        });
        const cloudData = await cloudRes.json();
        if (!cloudData.secure_url) throw new Error('Upload to Cloudinary failed');
        return cloudData.secure_url;
      } catch (error) {
        console.error('Upload failed:', error);
        return null;
      }
    });
    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(url => url !== null);
      setEditedImages(prev => [...prev, ...validImages]);
    } catch (error) {
      alert('Image upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = useCallback((index) => {
    setEditedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    const updatedProduct = {
      ...product,
      title: editedTitle,
      description: editedDescription,
      quantity: parseInt(editedQuantity) || 0,
      price: parseFloat(editedPrice),
      idCategory: selectedCategory,
      imageUrl: editedImages
    };
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
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
      const response = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleRestore = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/restore`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setProduct({ ...product, isDeleted: false });
      }
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  if (!product) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Product not found</div>;
  }

  return (
    <div className="detail-container">
      <h2 className="page-title">{t('productDetail', 'Product Detail')}</h2>
      
      <div className="product-form">
        <div className="form-left">
          <div className="image-upload-section">
            <h3><strong>{t('productImage', 'Product Image')}</strong></h3>
            {isEditing ? (
              <div className="image-upload-section">
                <h3>Add Images</h3>
                <div 
                  className="upload-area"
                  onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                  onDragOver={e => e.preventDefault()}
                  style={{ marginBottom: 24 }}
                >
                  <div className="upload-placeholder">
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                    <div className="upload-text">
                      <span>Drop your files here, or </span>
                      <label htmlFor="file-upload-detail" className="browse-link">Browse</label>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="file-upload-detail"
                    accept="image/*"
                    multiple
                    onChange={e => handleFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                </div>
                <div className="uploaded-images">
                  {editedImages.length > 0 ? (
                    editedImages.map((url, index) => (
                      <div key={index} className="image-item" style={{ position: 'relative' }}>
                        <div className="image-preview">
                          <img src={url} alt={`Product - ${index + 1}`} />
                        </div>
                        <div className="image-info">
                          <span className="image-name">Image #{index + 1}</span>
                        </div>
                        <button 
                          className="remove-image"
                          onClick={() => handleRemoveImage(index)}
                          type="button"
                          style={{ position: 'absolute', top: 20, right: 20 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="image-item">
                      <div className="image-preview">
                        <img src={'https://via.placeholder.com/400x400?text=No+Image'} alt="No image available" />
                      </div>
                      <div className="image-info">
                        <span className="image-name">No image available</span>
                      </div>
                    </div>
                  )}
                  {loading && <span style={{ marginLeft: 8 }}>Uploading...</span>}
                </div>
              </div>
            ) : (
              <div className="uploaded-images">
                {Array.isArray(product.imageUrl) && product.imageUrl.length > 0 ? (
                  product.imageUrl.map((url, index) => (
                    <div key={index} className="image-item">
                      <div className="image-preview" style={{ width: 120, height: 120 }}>
                        <img src={url} alt={`${product.title} - ${index + 1}`} />
                      </div>
                      <div className="image-info">
                        <span className="image-name">{product.title} #{index + 1}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="image-item">
                    <div className="image-preview" style={{ width: 120, height: 120 }}>
                      <img src={'https://via.placeholder.com/400x400?text=No+Image'} alt="No image available" />
                    </div>
                    <div className="image-info">
                      <span className="image-name">No image available</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="form-right">
        <h3><strong>{t('productDetail', 'Product Detail')}</strong></h3>
        <div className = "productID"><strong>Mã sản phẩm: </strong>{product._id}</div>
          {isEditing ? (
            <>
              <div className="form-group">
                <label>{t('title', 'Title')}</label>
                <input
                  className="form-input"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t('description', 'Description')}</label>
                <textarea
                  className="form-textarea"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </div>

                <div className="form-group">
                    <label>{t('quantity', 'Quantity')}</label>
                    <input
                        type="number"
                        className="form-input"
                        value={editedQuantity}
                        onChange={(e) => setEditedQuantity(e.target.value)}
                    />
                </div>

              <div className="form-group">
                <label>{t('price', 'Price')}</label>
                <input
                  type="number"
                  className="form-input"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t('category', 'Category')}</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t('selectCategory', 'Select a category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.idCategory} value={cat.idCategory}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
                <div className="detail-field">
                    <label className="detail-label">{t('title', 'Title')}:</label>
                    <span className="detail-value">{product.title}</span>
                </div>

                <div className="detail-field">
                    <label className="detail-label">{t('description', 'Description')}:</label>
                    <span className="detail-value">{product.description}</span>
                </div>

                <div className="detail-field">
                <label className="detail-label">{t('quantity', 'Quantity')}:</label>
                <span className="detail-value">{product.quantity}</span>
                </div>


                <div className="detail-field">
                    <label className="detail-label">{t('price', 'Price')}:</label>
                    <span className="detail-value">{product.price} VND</span>
                </div>

                <div className="detail-field">
                    <label className="detail-label">{t('category', 'Category')}:</label>
                    <span className="detail-value">
                    {categories.find(cat => cat.idCategory === product.idCategory)?.name || 'N/A'}
                    </span>
                </div>
            </>
          )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    className={`action-button ${isEditing ? 'action-save' : 'action-edit'}`}
                    onClick={handleEdit}
                >
                    {isEditing ? t('save') : t('edit')}
                </button>

                {product.isDeleted ? (
                    <button className="action-button action-restore" onClick={handleRestore}>
                    {t('restore')}
                    </button>
                ) : (
                    <button className="action-button action-delete" onClick={handleDelete}>
                    {t('delete')}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
