import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './create.css';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import { useTranslation } from 'react-i18next';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [cloudImageUrl, setCloudImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
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

        const root = result.data || [];
        extractChildren(root);
        setCategories(flatChildren);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dumv5xryl/image/upload';
    const UPLOAD_PRESET = 'RungRing';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      setLoading(true);
      const cloudRes = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error('Upload to Cloudinary failed');

      setImagePreview(cloudData.secure_url);
      setCloudImageUrl(cloudData.secure_url);
    } catch (error) {
      alert(t('imageUploadFailed') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !price || !quantity || !cloudImageUrl || !selectedCategory) {
      alert(t('pleaseFillFields'));
      return;
    }

    const newProduct = {
      title,
      description,
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0,
      imageUrl: cloudImageUrl,
      categoryId: selectedCategory
    };

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        navigate('/admin/products');
      } else {
        alert(t('createFailed'));
      }
    } catch (error) {
      alert(t('createError') + ': ' + error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="add-product-container">
        <h2>{t('addProductTitle')}</h2>

        <div className="form-group">
          <label>{t('title')}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('enterTitle')} />
        </div>

        <div className="form-group">
          <label>{t('description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('enterDescription')} />
        </div>

        <div className="form-group">
          <label>{t('price')}</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t('enterPrice')} />
        </div>

        <div className="form-group dropdown-wrapper">
          <label>{t('category')}</label>
          <div className="custom-select-wrapper">
            <select
              className="custom-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">{t('selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.idCategory} value={cat.idCategory}>
                  {cat.name}
                </option>
              ))}
            </select>
            <span className="arrow">&#9662;</span>
          </div>
        </div>

        <div className="form-group">
          <label>{t('quantity')}</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={t('enterQuantity')} />
        </div>

        <div className="form-group">
          <label>{t('image')}</label>
          <div className="upload-wrapper">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-placeholder">
              {loading ? <span>{t('loading')}</span> : imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <span>{t('uploadImage')}</span>
              )}
            </label>
          </div>
        </div>

        <button className="create-button" onClick={handleCreate}>
          {t('createProduct')}
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default AddProduct;
