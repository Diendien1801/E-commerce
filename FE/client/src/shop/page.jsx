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
                setProducts(Array.isArray(data.products) ? data.products : []);
                if (typeof data.total === 'number' && typeof data.limit === 'number') {
                setTotalPages(Math.ceil(data.total / data.limit));
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

    return (
        <div>
            <Navbar />
            <div className="shop-container">
                <aside className="shop-categories">
                    <h3>Categories</h3>
                </aside>
                <main className="shop-main">
                    <div className="shop-filter-bar">
                        <span>Sort by: </span>
                        <button className={sortOrder === 'price_low' ? 'active' : ''} onClick={() => { setSortOrder('price_low'); setPage(1); }}>Price Low-High</button>
                        <button className={sortOrder === 'price_high' ? 'active' : ''} onClick={() => { setSortOrder('price_high'); setPage(1); }}>Price High-Low</button>
                        <button className={sortOrder === 'newest' ? 'active' : ''} onClick={() => { setSortOrder('newest'); setPage(1); }}>Newest</button>
                    </div>
                    <div className="shop-product-list">
                        {products && products.length > 0 ? (
                            products.map(p => (
                                <ProductCard product={p} key={p._id} />
                            ))
                        ) : (
                            <div className="shop-empty">No products found.</div>
                        )}
                    </div>
                    <div className="shop-pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? 'active' : ''}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Shop;
