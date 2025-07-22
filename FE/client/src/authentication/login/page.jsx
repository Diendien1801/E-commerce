import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/context/authcontext';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import facebook from './Facebook.svg'; 
import './login.css';
import { jwtDecode } from "jwt-decode";

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

    const { login } = useAuth();

    useEffect(() => {
    window.fbAsyncInit = function () {
        window.FB.init({
            appId: '1127552465852819', 
            cookie: true,
            xfbml: true,
            version: 'v18.0'
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
            const response = await fetch('http://localhost:5000/api/auth/login', {
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
                alert('Login successful!');
                navigate('/');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="auth-container">
                <div className="auth-box">
                    <h2 className="auth-title" style={{ marginBottom: '0.7rem' }}>Sign In</h2>
                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.2rem', textAlign: 'center' }}>
                        Enter your email and password.
                    </div>
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div style={{ width: '100%', marginBottom: '0.2rem' }}>
                            <label htmlFor="email" className="label-bold" style={{ color: '#444', marginBottom: '0.1rem', display: 'block', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600 }}>Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="example@email.com"
                                className="auth-input"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={{ width: '100%', marginBottom: '0.2rem' }}>
                            <label htmlFor="password" className="label-bold" style={{ color: '#444', marginBottom: '0.1rem', display: 'block', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="password123"
                                className="auth-input"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                        <button type="submit" className="auth-btn">Login</button>
                        <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '0 0 0.7rem 0' }}>
                            <span style={{ flex: 1, height: '1px', background: '#ccc', marginRight: '8px' }}></span>
                            <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500 }}>or</span>
                            <span style={{ flex: 1, height: '1px', background: '#ccc', marginLeft: '8px' }}></span>
                        </div>
                        <button
                            type="button"
                            className="auth-btn auth-facebook-btn"
                            style={{ backgroundColor: '#1877F3', color: '#fff', fontWeight: 500 }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#1452a0'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#1877F3'}
                            onClick={async () => {
                                try {
                                    const facebookAccessToken = await getFacebookAccessToken(); 
                                    const response = await fetch('http://localhost:5000/auth/facebook', {
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
                                        alert('Facebook login successful!');
                                        navigate('/');
                                    } else {
                                        setError(data.message || 'Facebook login failed');
                                    }
                                } catch (err) {
                                    setError('Facebook login error');
                                }
                            }}
                        >
                            <img src={facebook} alt="Facebook" style={{height: '18px', verticalAlign: 'middle', marginRight: '8px'}} />
                            <span style={{fontSize: '0.82rem', verticalAlign: 'middle'}}>Sign in with Facebook</span>
                        </button>
                        <div className="auth-switch">
                            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
                        </div>
                        <div className="auth-switch" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Login;
