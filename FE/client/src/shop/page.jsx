import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import ProductCard from '../components/product-card/card';
import './shop.css';

const products_per_page = 20;

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('price_low');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        let url = `http://localhost:5000/api/products/filter-paginated?page=${page}&limit=${products_per_page}`;
        if (sortOrder === 'price_low') url += '&sort=price_asc';
        else if (sortOrder === 'price_high') url += '&sort=price_desc';
        else if (sortOrder === 'newest') url += '&sort=newest';

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                setProducts(Array.isArray(data.data.products) ? data.data.products : []);
                if (typeof data.data.total === 'number' && typeof data.data.limit === 'number') {
                setTotalPages(Math.ceil(data.data.total / data.data.limit));
                } else {
                    setTotalPages(1);
                }
            })
            .catch(err => {
                setProducts([]);
                setTotalPages(1);
                console.error('Failed to fetch products:', err);
            });
    }, [sortOrder, page]);

    const { t, i18n } = useTranslation();
    return (
        <div>
            <Navbar />
            <div className="shop-container">
                <aside className="shop-categories">
                    <h3>{t('categories')}</h3>
                </aside>
                <main className="shop-main">
                    <div className="shop-filter-bar">
                        <span>{t('sortBy')}: </span>
                        <button className={sortOrder === 'price_low' ? 'active' : ''} onClick={() => { setSortOrder('price_low'); setPage(1); }}>{t('priceLowHigh')}</button>
                        <button className={sortOrder === 'price_high' ? 'active' : ''} onClick={() => { setSortOrder('price_high'); setPage(1); }}>{t('priceHighLow')}</button>
                        <button className={sortOrder === 'newest' ? 'active' : ''} onClick={() => { setSortOrder('newest'); setPage(1); }}>{t('newest')}</button>
                    </div>
                    <div className="shop-product-list">
                        {products && products.length > 0 ? (
                            products.map(p => (
                                <ProductCard product={p} key={p._id} />
                            ))
                        ) : (
                            <div className="shop-empty">{t('noProductsFound')}</div>
                        )}
                    </div>
                    <div className="shop-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0' }}>
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            style={{
                                fontSize: 20,
                                padding: '4px 12px',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                opacity: page === 1 ? 0.5 : 1,
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            }}
                        >
                            &#8592;
                        </button>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages || totalPages === 0}
                            style={{
                                fontSize: 20,
                                padding: '4px 12px',
                                cursor: (page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                                opacity: (page === totalPages || totalPages === 0) ? 0.5 : 1,
                                border: 'none',
                                background: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                            }}
                        >
                            &#8594;
                        </button>
                    </div>
                </main>
            </div>
            {/* <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button onClick={() => i18n.changeLanguage('en')} style={{ marginRight: 8 }}>EN</button>
                <button onClick={() => i18n.changeLanguage('vi')}>VI</button>
            </div> */}
            <Footer />
        </div>
    );
};

export default Shop;
