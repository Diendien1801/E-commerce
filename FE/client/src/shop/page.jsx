import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/navbar';
import Footer from '../components/footer/footer';
import ProductCard from '../components/product-card/card';
import Breadcrumb from '../components/breadcrumb/page';
import { useTranslation } from 'react-i18next';
import './shop.css';

const products_per_page = 20;

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedParents, setExpandedParents] = useState({});
    const [selectedCategoryData, setSelectedCategoryData] = useState(null);

    const { t } = useTranslation();
    const location = useLocation();

    const toggleExpand = (idCategory) => {
        setExpandedParents(prev => ({
            ...prev,
            [idCategory]: !prev[idCategory],
        }));
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryFromUrl = params.get('category');
        if (categoryFromUrl) {
            setSelectedCategory(Number(categoryFromUrl));
        }
    }, [location.search]);

    useEffect(() => {
        sessionStorage.setItem('previousPage', '/shop');
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/categories/hierarchy')
            .then(res => res.json())
            .then(data => {
                const categoriesData = data.data || [];
                setCategories(categoriesData);

                // Only set default category if no category is selected and no category in URL
                const params = new URLSearchParams(location.search);
                if (!selectedCategory && !params.get('category') && categoriesData.length > 0) {
                    const firstCategory = categoriesData[0];
                    setSelectedCategory(firstCategory.idCategory);

                    // Auto-expand if has children
                    if (firstCategory.children && firstCategory.children.length > 0) {
                        setExpandedParents(prev => ({
                            ...prev,
                            [firstCategory.idCategory]: true
                        }));
                    }
                }
            })
            .catch(err => console.error('Failed to fetch categories:', err));
    }, [selectedCategory, location.search]);

    const findCategoryData = (categoryId, categoriesList) => {
        for (const parent of categoriesList) {
            if (parent.idCategory === categoryId) {
                return parent;
            }
            if (parent.children) {
                for (const child of parent.children) {
                    if (child.idCategory === categoryId) {
                        return child;
                    }
                }
            }
        }
        return null;
    };

    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const categoryData = findCategoryData(selectedCategory, categories);
            setSelectedCategoryData(categoryData);

            for (const parent of categories) {
                if (parent.children?.some(c => c.idCategory === selectedCategory)) {
                    setExpandedParents(prev => ({
                        ...prev,
                        [parent.idCategory]: true
                    }));
                }
            }
        } else {
            setSelectedCategoryData(null);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        if (selectedCategory === null) return;
        let url = selectedCategory
            ? `http://localhost:5000/api/products/category/${selectedCategory}?page=${page}&limit=${products_per_page}`
            : `http://localhost:5000/api/products/filter-paginated?page=${page}&limit=${products_per_page}`;

        if (sortOrder === 'price_low') url += '&sort=price_asc';
        else if (sortOrder === 'price_high') url += '&sort=price_desc';
        else if (sortOrder === 'newest') url += '&sort=newest';

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                console.log('Product API response:', data.data);
                setProducts(Array.isArray(data.data.products) ? data.data.products : []);
                if (typeof data.data.pagination.totalPages === 'number') {
                     setTotalPages(data.data.pagination.totalPages);
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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

    return (
        <div>
            <Navbar />
            <Breadcrumb />

            {selectedCategoryData && selectedCategoryData.image && (
                <div className="category-banner">
                    <img
                        src={selectedCategoryData.image}
                        alt={selectedCategoryData.name}
                        className="category-banner-image"
                    />
                </div>
            )}

            {selectedCategoryData && selectedCategoryData.idCategory === 104 && (
                <div className="category-banner">
                    <img
                        src="https://theme.hstatic.net/1000304920/1001307865/14/banner_3_image_1.png?v=466"
                        alt="Vinyl Collection"
                        className="category-banner-image"
                    />
                </div>
            )}

            <div className="shop-container">
                <aside className="shop-categories">
                    <h3 style={{ fontSize: "1.2rem" }}>{t('categories')}</h3>
                    {renderCategoryTree(categories)}
                </aside>
                <main className="shop-main">
                    <div className="shop-filter-bar">
                        <span>{t('sortBy')}: </span>
                        <select
                            className="shop-filter-select"
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price_low">Giá, thấp đến cao</option>
                            <option value="price_high">Giá, cao đến thấp</option>
                        </select>
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
