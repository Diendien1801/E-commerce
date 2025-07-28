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
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        fetch('http://localhost:5000/api/products') 
            .then(res => res.json())
            .then(data => {
                setProducts(data);
            })
            .catch(err => console.error('Failed to fetch products:', err));
    }, []);

    const filterAndSlice = (filterFn) => products.filter(filterFn).slice(0, 5);
    const available = products.slice(0, 10);

    return (
        <div className='container'>
            <Navbar />
            <div className="home-page">
                <Banner />
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