import React, { useState } from 'react';
import './navbar.css';
import logo from './logo.png';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navbar = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);
        setError(null);
        if (value.trim().length === 0) {
            setSearchResults([]);
            setShowResults(false);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(value)}`);
            const data = await res.json();
            console.log('Search Results:', data);
            setSearchResults(Array.isArray(data) ? data: []);
            setShowResults(true);
        } catch (err) {
            setSearchResults([]);
            setShowResults(true);
            setError('Failed to fetch results');
        }
        setLoading(false);
    };

    const handleBlur = () => {
        setTimeout(() => setShowResults(false), 150); 
    };

    return (
        <div className="navbar-container">
            <div className="header">
                <div className="header-col header-login">
                    <button className="login-btn">
                        <i className="bi bi-person-circle login-icon"></i>
                        Login
                    </button>
                </div>
                <div className="header-col header-logo">
                    <a href="/" className="logo-link">
                        <img src={logo} alt="E-commerce Logo" className="logo-img" />
                    </a>
                </div>
                <div className="header-col header-cart">
                    <button className="cart-btn">
                        <i className="bi bi-cart2 cart-icon"></i> Cart
                    </button>
                </div>
            </div>
            <hr style={{ margin: 0, border: 0, borderTop: '2px solid #111' }} />
            <nav className="navbar">
                <div className="navbar-flex">
                    <a href="/" className="nav-col nav-button">HOME</a>
                    <a href="/shop" className="nav-col nav-button">SHOP</a>
                    <a href="/contact" className="nav-col nav-button">CONTACT</a>
                    <button className="crawl-btn">Crawl</button>
                    <div className="nav-col nav-search" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search"
                            value={search}
                            onChange={handleSearch}
                            onFocus={() => search && setShowResults(true)}
                            onBlur={handleBlur}
                        />
                        <i className="bi bi-search search-icon" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none', fontSize: '1.1em' }}></i>
                        {showResults && (
                            <div className="search-dropdown">
                                {loading ? (
                                    <div className="search-loading" style={{ padding: '10px', color: '#888' }}>Loading...</div>
                                ) : error ? (
                                    <div className="search-error" style={{ padding: '10px', color: 'red' }}>{error}</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((item) => (
                                        <a
                                            key={item._id}
                                            href={`/view-product/${item._id}`}
                                            className="search-result-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px',
                                                borderBottom: '1px solid #f0f0f0',
                                                color: '#222',
                                                textDecoration: 'none',
                                                background: '#fff',
                                            }}
                                        >
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </a>
                                    ))
                                ) : search.trim() ? (
                                    <div className="search-empty" style={{ padding: '10px', color: '#888' }}>No results found.</div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;