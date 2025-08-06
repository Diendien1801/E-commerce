import React, { useEffect, useState } from 'react';
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
    const [selectedCategoryData, setSelectedCategoryData] = useState(null); // Lưu thông tin category đã chọn

    const { t } = useTranslation();

    const toggleExpand = (idCategory) => {
        setExpandedParents(prev => ({
            ...prev,
            [idCategory]: !prev[idCategory],
        }));
    };

    useEffect(() => {
        sessionStorage.setItem('previousPage', '/shop');
    }, []);

    useEffect(() => {
    fetch('http://localhost:5000/api/categories/hierarchy')
        .then(res => res.json())
        .then(data => {
            const categoriesData = data.data || [];
            setCategories(categoriesData);
            
            // Tự động chọn category đầu tiên nếu chưa có category nào được chọn
            if (!selectedCategory && categoriesData.length > 0) {
                const firstCategory = categoriesData[0];
                setSelectedCategory(firstCategory.idCategory);
                
                // Tự động expand category đầu tiên nếu có children
                if (firstCategory.children && firstCategory.children.length > 0) {
                    setExpandedParents(prev => ({
                        ...prev,
                        [firstCategory.idCategory]: true
                    }));
                }
            }
        })
        .catch(err => console.error('Failed to fetch categories:', err));
}, [selectedCategory]);

    // Function để tìm category data từ selectedCategory
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

    // Update selectedCategoryData khi selectedCategory hoặc categories thay đổi
    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const categoryData = findCategoryData(selectedCategory, categories);
            setSelectedCategoryData(categoryData);
        } else {
            setSelectedCategoryData(null);
        }
    }, [selectedCategory, categories]);

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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <button
                                    className={`category-btn ${selectedCategory === parent.idCategory ? 'active' : ''}`}
                                    data-category={parent.name.toLowerCase().replace(/\s+/g, '-')}
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
        
        {/* Category Banner */}
        {selectedCategoryData && selectedCategoryData.image && (
            <div className="category-banner">
                <img 
                    src={selectedCategoryData.image} 
                    alt={selectedCategoryData.name}
                    className="category-banner-image"
                />
            </div>
        )}
        
        <div className="shop-container">
            <aside className="shop-categories">
                <h3 style={{fontSize:"1.2rem"}}>{t('categories')}</h3>
                {/* Bỏ phần "Tất cả danh mục" */}
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