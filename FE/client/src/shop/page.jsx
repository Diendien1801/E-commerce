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
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedParents, setExpandedParents] = useState({});

    const toggleExpand = (idCategory) => {
        setExpandedParents(prev => ({
            ...prev,
            [idCategory]: !prev[idCategory],
        }));
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/categories/hierarchy')
            .then(res => res.json())
            .then(data => {
                setCategories(data.data || []);
            })
            .catch(err => console.error('Failed to fetch categories:', err));
    }, []);

    useEffect(() => {
        let url = selectedCategory
            ? `http://localhost:5000/api/products/category/${selectedCategory}?page=${page}&limit=${products_per_page}`
            : `http://localhost:5000/api/products/filter-paginated?page=${page}&limit=${products_per_page}`;

        if (!selectedCategory) {
            if (sortOrder === 'price_low') url += '&sort=price_asc';
            else if (sortOrder === 'price_high') url += '&sort=price_desc';
            else if (sortOrder === 'newest') url += '&sort=newest';
        }

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
    }, [sortOrder, page, selectedCategory]);

    const renderCategoryTree = (categories) => {
        return (
            <ul className="category-list">
                {categories.map(parent => (
                    <li key={parent.idCategory} className="category-item">
                        <div className="category-parent">
                            <button
                                className={`category-btn ${selectedCategory === parent.idCategory ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(parent.idCategory);
                                    setPage(1);
                                }}
                            >
                                {parent.name}
                            </button>
                            {parent.children && parent.children.length > 0 && (
                                <button
                                    className="toggle-btn"
                                    onClick={() => toggleExpand(parent.idCategory)}
                                >
                                   <span className="arr">{expandedParents[parent.idCategory] ? '▲' : '▼'}</span>
                                </button>
                            )}
                        </div>
                        {expandedParents[parent.idCategory] && parent.children.length > 0 && (
                            <ul className="subcategory-list">
                                {parent.children.map(child => (
                                    <li key={child.idCategory}>
                                        <button
                                            className={`subcategory-btn ${selectedCategory === child.idCategory ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(child.idCategory);
                                                setPage(1);
                                            }}
                                        >
                                            {child.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    const { t } = useTranslation();
    return (
        <div>
            <Navbar />
            <div className="shop-container">
                <aside className="shop-categories">
                    <h3 style={{fontSize:"1.2rem"}}>{t('categories')}</h3>
                    <button
                        className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedCategory(null);
                            setPage(1);
                        }}
                    >
                        {t('allCategories')}
                    </button>
                    {renderCategoryTree(categories)}
                </aside>
                <main className="shop-main">
                    <div className="shop-filter-bar">
                        <span>{t('sortBy')}: </span>
                        <button className={sortOrder === 'price_low' ? 'active' : ''} onClick={() => { setSortOrder('price_low'); setPage(1); }}>{t('priceLowHigh')}</button>
                        <button className={sortOrder === 'price_high' ? 'active' : ''} onClick={() => { setSortOrder('price_high'); setPage(1); }}>{t('priceHighLow')}</button>
                        <button className={sortOrder === 'newest' ? 'active' : ''} onClick={() => { setSortOrder('newest'); setPage(1); }}>{t('newest')}</button>
                    </div>
                    <div className="shop-product-list">
                        {products.length > 0 ? (
                            products.map(p => (
                                <ProductCard product={p} key={p._id} />
                            ))
                        ) : (
                            <div className="shop-empty">{t('noProductsFound')}</div>
                        )}
                    </div>
                    <div className="shop-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0' }}>
                        <button onClick={() => setPage(page - 1)} disabled={page === 1}>&#8592;</button>
                        <span style={{ fontWeight: 600, fontSize: 18 }}>{page}</span>
                        <button onClick={() => setPage(page + 1)} disabled={page === totalPages || totalPages === 0}>&#8594;</button>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Shop;
