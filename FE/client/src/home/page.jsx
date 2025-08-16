import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import Banner from '../components/banner/banner';
import ProductCard from '../components/product-card/card';
import './home.css';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [vinylProducts, setVinylProducts] = useState([]); 
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
useEffect(() => {
        sessionStorage.setItem('previousPage', '/');
    }, []);
    useEffect(() => {
        // Fetch products category 104
        fetch('http://localhost:5000/api/products/category/104') 
            .then(res => res.json())
            .then(data => {
                setProducts(data.data.products || []);
            })
            .catch(err => console.error('Failed to fetch products:', err));

        // Fetch vinyl products category 303
        fetch('http://localhost:5000/api/products/category/303') 
            .then(res => res.json())
            .then(data => {
                setVinylProducts(data.data.products || []);
            })
            .catch(err => console.error('Failed to fetch vinyl products:', err));
    }, []);

    const filterAndSlice = (filterFn) => products.filter(filterFn).slice(0, 5);
    const available = products.slice(0, 10);
    const vinylAvailable = vinylProducts.slice(0, 5);

    return (
        
        <div className='container'>
            <Navbar />
            <div className="home-page">
                <Banner />
                <section className="featured-images-section">
                    <div className="featured-images-grid">
                        <div className="featured-image-item large" 
                            onClick={() => navigate('/shop?category=104')} 
                            style={{ cursor: 'pointer' }}>
                            <img 
                                src="https://theme.hstatic.net/1000304920/1001307865/14/banner_3_image_1.png?v=466" 
                                alt="Vinyl Collection"/>
                        </div>
                        <div className="featured-image-item medium">
                            <div className="featured-image-item large" 
                                onClick={() => navigate('/shop?category=102')} 
                                style={{ cursor: 'pointer' }}>
                                <img src="https://theme.hstatic.net/1000304920/1001307865/14/banner_3_image_2.png?v=466" 
                                    alt="CD Collection" />
                            </div>
                        </div>
                        <div className="featured-images-right">
                            <div className="featured-image-item small">
                                <div className="featured-image-item large" 
                                onClick={() => navigate('/shop?category=1')} 
                                style={{ cursor: 'pointer' }}>
                                <img src="https://theme.hstatic.net/1000304920/1001307865/14/banner_3_image_3_2.png?v=466" 
                                    alt="Times Collection" />
                            </div>
                        </div>
                        <div className="featured-image-item small">
                            <div className="featured-image-item large" 
                            onClick={() => navigate('/shop?category=103')} 
                            style={{ cursor: 'pointer' }}>
                            <img src="https://theme.hstatic.net/1000304920/1001307865/14/banner_3_image_3.png?v=466" 
                                alt="Cassette Collection" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
                <div className="product-sections">
                    <section className="product-section">
                        <div className="section-header">
                            <h2>{t('available')}</h2>
                            <button className="show-all-btn" onClick ={() => navigate('../shop/')}>{t('showAllProducts')} &gt;</button>
                        </div>
                        <div className="product-list">
                            {available.map(p => (
                                <ProductCard product={p} key={p._id} />
                            ))}
                        </div>
                    </section>
                    {/* New Vinyl section */}
    <section className="product-section">
        <div className="section-header">
            <h2>Bộ sưu tập Vinyl</h2>
            <button className="show-all-btn" onClick={() => navigate('../shop?category=303')}>Xem tất cả Vinyl &gt;</button>
        </div>
        <div className="product-list">
            {vinylAvailable.map(p => (
                <ProductCard product={p} key={p._id} />
            ))}
        </div>
    </section>
                    {/* <section className="product-section">
                        <h2>{t('trending')}</h2>
                        <div className="product-list">
                            {trending.map(renderProduct)}
                        </div>
                    </section>
                    <section className="product-section">
                        <h2>{t('newArrival')}</h2>
                        <div className="product-list">
                            {newArrival.map(renderProduct)}
                        </div>
                    </section>
                    <section className="product-section">
                        <h2>{t('sale')}</h2>
                        <div className="product-list">
                            {sale.map(renderProduct)}
                        </div>
                    </section> */}
                </div>
            </div>
            {/* <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={() => i18n.changeLanguage('en')} style={{ marginRight: 8 }}>EN</button>
                <button onClick={() => i18n.changeLanguage('vi')}>VI</button>
            </div> */}
            <Footer />
        </div>
    );
}

export default Home;