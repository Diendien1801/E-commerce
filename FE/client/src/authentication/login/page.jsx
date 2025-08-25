import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/context/authcontext';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import facebook from './Facebook.svg'; 
import './login.css';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
const getFacebookAccessToken = () => {
    return new Promise((resolve, reject) => {
        if (!window.FB) return reject("FB SDK not loaded");

        window.FB.login(response => {
            if (response.authResponse) {
                resolve(response.authResponse.accessToken);
            } else {
                reject("User cancelled login or did not authorize");
            }
        }, { scope: 'public_profile,email' });
    });
};


const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { login } = useAuth();

    useEffect(() => {
    window.fbAsyncInit = function () {
        window.FB.init({
            appId: '1680758335909974', 
            cookie: true,
            xfbml: true,
            version: 'v23.0'
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
}, []);

    //console.log(getFacebookAccessToken())

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });
            const data = await response.json();
            if (response.ok) {
                const token = data.data.token;
                let userInfo;
                if (token) {
                    try {
                        const decoded = jwtDecode(token);
                        userInfo = { _id: decoded.id, email: decoded.email };
                    } catch (err) {
                        userInfo = null;
                    }
                }
                login(token, userInfo);
                navigate('/');
            } else {
                setError(data.message || t('loginFailed'));
            }
        } catch (err) {
            setError(t('serverErrorTryAgain'));
        }
    };

    return (
    <div className="login-root">
        <video className="login-bg-video-outer" autoPlay loop muted playsInline>
            <source src="https://video.wixstatic.com/video/a32999_9dcec2e29eaa44d7ab572cee2262b70e/1080p/mp4/file.mp4" type="video/mp4" />
        </video>
        <div className="login-main-container">
            <div className="login-quote-side">
               <div className="login-quote-label">MUSIC INSPIRATION</div>
                <div className="login-quote-title">Feel<br/>The Music<br/>In Your Soul</div>
                <div className="login-quote-desc">Discover the magic of music. Every record tells a story—find yours and let the melodies inspire your life.</div>
            </div>
            <div className="login-form-side">
                <div className="login-glass-box">
                    <div className="auth-box">
                        {/* Nút quay lại home */}
                        <button 
                            className="back-to-home-btn"
                            onClick={() => navigate('/')}
                            type="button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Trang chủ
                        </button>

                        <h2 className="auth-title-modern">Đăng nhập</h2>
                        <div className="auth-subtitle">
                            Nhập email của bạn để tiếp tục
                        </div>
                        
                        <form className="auth-form-modern" onSubmit={handleSubmit}>
                            <div className="input-group-modern">
                                <label htmlFor="email" className="input-label-modern">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    className="input-modern"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="input-group-modern">
                                <label htmlFor="password" className="input-label-modern">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    className="input-modern"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="remember-forgot-row">
                                <label className="remember-checkbox">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember
                                </label>
                                <Link to="/forgot-password" className="forgot-link">Forgot Password</Link>
                            </div>

                            {error && <div className="error-message">{error}</div>}
                            
                            <button type="submit" className="continue-btn">
                                Đăng nhập
                            </button>
                            
                            <div className="auth-divider-modern">
                                
                            </div>
                            
                            <button
                                type="button"
                                className="facebook-btn-modern"
                                onClick={async () => {
                                   try {
                                    const facebookAccessToken = await getFacebookAccessToken(); 
                                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/facebook`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ access_token: facebookAccessToken })
                                    });
                                    const data = await response.json();
                                    
                                    if (response.ok && data.success && data.data && data.data.token && data.data.user) {
                                        let userInfo = data.data.user;
                                        if (!userInfo._id && data.data.token) {
                                            try {
                                                const decoded = jwtDecode(data.data.token);
                                                userInfo._id = decoded.id;
                                                userInfo.email = decoded.email;
                                            } catch (err) {}
                                        }
                                        login(data.data.token, userInfo);
                                        navigate('/');
                                        toast.success(t('facebookLoginSuccessful'));
                                        navigate('/');
                                    } else {
                                        setError(data.message || t('facebookLoginFailed'));
                                    }
                                } catch (err) {
                                    setError(t('facebookLoginError'));
                                }
                                }}
                            >
                                <img src={facebook} alt="Facebook" />
                                Đăng nhập với Facebook
                            </button>
                            
                            <div className="auth-switch-modern">
                                Chưa có tài khoản? <Link to="/register" className="signup-link">Đăng ký</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

export default Login;
