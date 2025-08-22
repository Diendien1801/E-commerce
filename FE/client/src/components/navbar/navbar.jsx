import React, { useState, useEffect} from 'react';
import { useAuth } from '../context/authcontext';
import './navbar.css';
import logo from './logo.png';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [cartCount, setCartCount] = useState(0); 
    const navigate = useNavigate();

    const { isLoggedIn, user, logout } = useAuth();

    const userId = user?._id || user?.userId || user?.id;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:5000/api/users/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user data');
                const data = await response.json();
                setUserRole(data.data.role);  
            } catch (err) {
                console.error('Error fetching user role:', err);
            }
        };

    fetchUserRole();
    }, [userId]);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`http://localhost:5000/api/cart/user/${userId}`);
                if (!res.ok) throw new Error("Failed to fetch cart");
                const data = await res.json();
                console.log(data);
                setCartCount(data?.data?.summary?.totalItems || 0);
            } catch (err) {
                console.error("Error fetching cart:", err);
            }
        };
        fetchCartCount();
    }, [userId]);

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
            setSearchResults(Array.isArray(data.data) ? data.data: []);
            console.log(data);
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

    const { t, i18n } = useTranslation();
    return (
        <div className="navbar-container">
            <div className="header">
                <div className="header-col header-login">
                    {!isLoggedIn ? (
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <button className="login-btn">
                                <i className="bi bi-person-circle login-icon"></i>
                                {t('login')}
                            </button>
                        </Link>
                    ) : (
                         <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className="login-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setShowDropdown(v => !v)}>
                {/* Avatar và tên người dùng */}
                {user?.avatar && (
                    <img
                        src={user.avatar}
                        alt="avatar"
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginRight: 8,
                            border: '1px solid #eee'
                        }}
                    />
                )}
                <span style={{ fontWeight: 500, marginRight: 4 }}>
                    {user?.name  || 'Hoang Dien Tran'}
                </span>
               
                
                <span style={{ fontSize: '1.1em'}}>&#9662;</span>
                            </button>
                            {showDropdown && (
                                <div style={{ position: 'absolute', top: '110%', right: '25px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: '8px', minWidth: '160px', zIndex: 10 }}>
                                    {userId && (
                                        <Link
                                            to={"/profile/" + userId}
                                            style={{
                                                display: 'block',
                                                padding: '0.7rem 1.2rem',
                                                color: '#222',
                                                textDecoration: 'none',
                                                fontWeight: 500,
                                                borderBottom: '1px solid #eee',
                                                transition: 'background 0.18s',
                                            }}
                                            onClick={() => setShowDropdown(false)}
                                            onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                        >
                                            {t('profile')}
                                        </Link>
                                    )}
                                    <Link
                                        to="/favourite"
                                        style={{
                                            display: 'block',
                                            padding: '0.7rem 1.2rem',
                                            color: '#222',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            transition: 'background 0.18s',
                                        }}
                                        onClick={() => setShowDropdown(false)}
                                        onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        {t('favouriteProducts')}
                                    </Link>
                                    <Link
                                        to="/order"
                                        style={{
                                            display: 'block',
                                            padding: '0.7rem 1.2rem',
                                            color: '#222',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            transition: 'background 0.18s',
                                        }}
                                        onClick={() => setShowDropdown(false)}
                                        onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        {t('orderHistory')}
                                    </Link>
                                    {userRole === 'admin' && (
                                    <>
                                        <Link
                                            to="/admin/dashboard"
                                            style={{
                                            display: 'block',
                                            padding: '0.7rem 1.2rem',
                                            color: '#222',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            borderTop: '1px solid #eee',
                                            transition: 'background 0.18s',
                                        }}
                                            onClick={() => setShowDropdown(false)}
                                            onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                                            onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                        >
                                            {t('adminDashboard')}
                                        </Link>
                                    </>
                                )}
                                    <Link
                                        to="/"
                                        style={{
                                            display: 'block',
                                            padding: '0.7rem 1.2rem',
                                            color: '#222',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            borderTop: '1px solid #eee',
                                            transition: 'background 0.18s',
                                        }}
                                        onClick={e => {
                                            e.preventDefault();
                                            setShowDropdown(false);
                                            logout();
                                            window.location.href = '/';
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                                        onMouseOut={e => e.currentTarget.style.background = '#fff'}
                                    >
                                        {t('logout')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="header-col header-logo">
                    <a href="/" className="logo-link">
                        <img src={logo} alt="E-commerce Logo" className="logo-img" />
                    </a>
                </div>
                <div className="header-col header-cart" style={{ position: 'relative' }}>
                    <button className="cart-btn" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
                        <i className="bi bi-cart2 cart-icon"></i> {t('cart')}
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '45px',
                                background: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '1px 5px',
                                fontSize: '12px',
                                fontWeight: 'semibold',
                                lineHeight: 1
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            <hr style={{ margin: 0, border: 0, borderTop: '2px solid #111', maxWidth: '1200px', margin: '0 auto' }} />
            <nav className="navbar">
                <div className="navbar-flex navbar-flex-custom">
                    <div className="nav-left-cluster">
                        <a href="/" className="nav-col nav-button">{t('home')}</a>
                        <a href="/shop" className="nav-col nav-button">{t('shop')}</a>
                        <a href="/contact" className="nav-col nav-button">{t('contact')}</a>
                    </div>
                    <div className="nav-right-cluster">
                        <button
                            className="lang-switch-btn"
                            onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                        >
                            {i18n.language === 'vi' ? (
                                <>
                                    <svg width="20" height="15" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 6 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67379)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0H32V24H0V0Z" fill="#F7FCFF"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#E31D1C"/><mask id="mask0_270_67379" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67379)"><path fillRule="evenodd" clipRule="evenodd" d="M16.0619 15.98L10.9111 19.2549L12.6388 13.5219L8.96483 9.77622L14.03 9.66557L16.271 4.00574L18.313 9.74033L23.3661 9.82853L19.5688 13.6429L21.342 19.0968L16.0619 15.98Z" fill="#FFD221"/></g></g><defs><clipPath id="clip0_270_67379"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
                                    VI
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="15" viewBox="0 0 32 24" style={{ verticalAlign: 'middle', marginRight: 6 }} xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_270_67366)"><rect width="32" height="24" fill="white"/><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="#2E42A5"/><mask id="mask0_270_67366" style={{maskType:'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="24"><path fillRule="evenodd" clipRule="evenodd" d="M0 0V24H32V0H0Z" fill="white"/></mask><g mask="url(#mask0_270_67366)"><path d="M-3.56311 22.2854L3.47858 25.2635L32.1598 3.23787L35.8741 -1.18761L28.3441 -2.18297L16.6457 7.3085L7.22968 13.7035L-3.56311 22.2854Z" fill="white"/><path d="M-2.59912 24.3719L0.988295 26.1001L34.5403 -1.59881H29.5032L-2.59912 24.3719Z" fill="#F50100"/><path d="M35.5631 22.2854L28.5214 25.2635L-0.159817 3.23787L-3.87415 -1.18761L3.65593 -2.18297L15.3543 7.3085L24.7703 13.7035L35.5631 22.2854Z" fill="white"/><path d="M35.3229 23.7829L31.7355 25.5111L17.4487 13.6518L13.2129 12.3267L-4.23151 -1.17246H0.805637L18.2403 12.0063L22.8713 13.5952L35.3229 23.7829Z" fill="#F50100"/><mask id="path-7-inside-1_270_67366" fill="white"><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z"/></mask><path fillRule="evenodd" clipRule="evenodd" d="M19.7778 -2H12.2222V8H-1.97247V16H12.2222V26H19.7778V16H34.0275V8H19.7778V-2Z" fill="#F50100"/><path d="M12.2222 -2V-4H10.2222V-2H12.2222ZM19.7778 -2H21.7778V-4H19.7778V-2ZM12.2222 8V10H14.2222V8H12.2222ZM-1.97247 8V6H-3.97247V8H-1.97247ZM-1.97247 16H-3.97247V18H-1.97247V16ZM12.2222 16H14.2222V14H12.2222V16ZM12.2222 26H10.2222V28H12.2222V26ZM19.7778 26V28H21.7778V26H19.7778ZM19.7778 16V14H17.7778V16H19.7778ZM34.0275 16V18H36.0275V16H34.0275ZM34.0275 8H36.0275V6H34.0275V8ZM19.7778 8H17.7778V10H19.7778V8ZM12.2222 0H19.7778V-4H12.2222V0ZM14.2222 8V-2H10.2222V8H14.2222ZM-1.97247 10H12.2222V6H-1.97247V10ZM0.0275269 16V8H-3.97247V16H0.0275269ZM12.2222 14H-1.97247V18H12.2222V14ZM14.2222 26V16H10.2222V26H14.2222ZM19.7778 24H12.2222V28H19.7778V24ZM17.7778 16V26H21.7778V16H17.7778ZM34.0275 14H19.7778V18H34.0275V14ZM32.0275 8V16H36.0275V8H32.0275ZM19.7778 10H34.0275V6H19.7778V10ZM17.7778 -2V8H21.7778V-2H17.7778Z" fill="white" mask="url(#path-7-inside-1_270_67366)"/></g></g><defs><clipPath id="clip0_270_67366"><rect width="32" height="24" fill="white"/></clipPath></defs></svg>
                                    EN
                                </>
                            )}
                        </button>
                        <div className="nav-col nav-search nav-search-custom">
                            <input
                                type="text"
                                className="search-input search-input-custom"
                                placeholder={t('search')}
                                value={search}
                                onChange={handleSearch}
                                onFocus={() => search && setShowResults(true)}
                                onBlur={handleBlur}
                            />
                            <i className="bi bi-search search-icon search-icon-custom"></i>
                            {showResults && (
                                <div className="search-dropdown search-dropdown-custom" style={{width: '374px'}}>
                                    {loading ? (
                                        <div className="search-loading" style={{ padding: '10px', color: '#888' }}>{t('loading')}</div>
                                    ) : error ? (
                                        <div className="search-error" style={{ padding: '10px', color: 'red' }}>{t('searchError')}</div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((item) => (
                                            <a
                                                key={item._id}
                                                href={`/view-product/${item._id}`}
                                                className="search-result-item"
                                            >
                                                {item.imageUrl && (
                                                    <img
                                                        src={item.imageUrl[0]}
                                                        alt={item.title}
                                                        className="search-result-img"
                                                    />
                                                )}
                                                <span>{item.title}</span>
                                            </a>
                                        ))
                                    ) : search.trim() ? (
                                        <div className="search-empty" style={{ padding: '10px', color: '#888' }}>{t('noResults')}</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;