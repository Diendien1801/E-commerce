import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './create.css';
import { useTranslation } from 'react-i18next';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories/hierarchy');
        const result = await res.json();
        const flatten = (nodes) => {
          let arr = [];
          for (let node of nodes) {
            arr.push({ ...node });
            if (node.children && node.children.length > 0) {
              arr = arr.concat(flatten(node.children));
            }
          }
          return arr;
        };
        const allCategories = flatten(result.data || []);
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.idCategory === selectedCategory);
      if (category && category.children) {
        setSubCategories(category.children);
      } else {
        setSubCategories([]);
      }
      setSelectedSubCategory('');
    }
  }, [selectedCategory, categories]);

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

        return {
          id: Date.now() + Math.random(),
          url: cloudData.secure_url,
          name: file.name,
          size: file.size,
          uploading: false
        };
      } catch (error) {
        console.error('Upload failed:', error);
        return null;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null);
      setImages(prev => [...prev, ...validImages]);
    } catch (error) {
      alert(t('imageUploadFailed') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCreate = async () => {
    if (!title || !description || !price || !quantity || images.length === 0 || !selectedCategory) {
      alert(t('pleaseFillFields'));
      return;
    }

    const newProduct = {
      title,
      description,
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0,
      imageUrl: images.map(img => img.url),
      idCategory: Number(selectedCategory),
      subCategoryId: selectedSubCategory || null,
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
      <div className="add-product-container">
        <h2 className="page-title">Add Product</h2>

        <div className="product-form">
          <div className="form-left">
            <div className="image-upload-section">
              <h3>Add Images</h3>
              
              <div 
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
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
                    <label htmlFor="file-upload" className="browse-link">Browse</label>
                  </div>
                </div>
                
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  style={{ display: 'none' }}
                />
              </div>

              {images.length > 0 && (
                <div className="uploaded-images">
                  {images.map((image) => (
                    <div key={image.id} className="image-item">
                      <div className="image-preview">
                        <img src={image.url} alt={image.name} />
                      </div>
                      <div className="image-info">
                        <span className="image-name">{image.name}</span>
                        <span className="image-size">{formatFileSize(image.size)}</span>
                        {loading && <div className="progress-bar"><div className="progress-fill"></div></div>}
                      </div>
                      <button 
                        className="remove-image"
                        onClick={() => removeImage(image.id)}
                        type="button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-right">
            <div className="form-group">
              <label>Product Name</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter product name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.idCategory} value={cat.idCategory}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="Enter product quantity"
                className="form-input"
              />
            </div>


            {subCategories.length > 0 && (
              <div className="form-group">
                <label>Sub Category</label>
                <select
                  className="form-select"
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                >
                  <option value="">Select sub category</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.idCategory} value={subCat.idCategory}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="Enter price"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Enter product description"
                className="form-textarea"
                rows="4"
              />
            </div>

            <button className="publish-button" onClick={handleCreate}>
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;