import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './create.css';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [cloudImageUrl, setCloudImageUrl] = useState('');
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dumv5xryl/image/upload';
    const UPLOAD_PRESET = 'RungRing';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const cloudRes = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) {
        throw new Error('Upload to Cloudinary failed');
      }

      setImagePreview(cloudData.secure_url);
      setCloudImageUrl(cloudData.secure_url);
    } catch (error) {
      alert('Image upload failed: ' + error.message);
      console.error(error);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !price || !cloudImageUrl) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

    const newProduct = {
      title,
      description,
      price: parseFloat(price) || 0,
      imageUrl: cloudImageUrl,
    };

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        // navigate('/admin/products');
        console.log('Product created successfully');
      } else {
        alert('Failed to create product');
      }
    } catch (error) {
      alert('Error creating product: ' + error.message);
      console.error(error);
    }
  };

  return (
    <div>
    <Navbar />
    <div className="add-product-container">
      <h2>Add New Product</h2>

      <div className="form-group">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
      </div>

      <div className="form-group">
        <label>Price</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" />
      </div>

      <div className="form-group">
        <label>Image</label>
        <div className="upload-wrapper">
            <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-placeholder">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
            ) : (
                <span>Upload image</span>
            )}
            </label>
        </div>
        </div>



      <button className="create-button" onClick={handleCreate}>Create Product</button>
    </div>
    <Footer />
    </div>
  );
};

export default AddProduct;
