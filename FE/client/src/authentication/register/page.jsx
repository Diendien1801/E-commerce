import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import facebook from '../login/Facebook.svg'; 
import './register.css';

function Register() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Facebook SDK setup
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại.');
    }
  };

  return (
    <div className="login-root">
      <video className="login-bg-video-outer" autoPlay loop muted playsInline>
        <source src="https://video.wixstatic.com/video/a32999_9dcec2e29eaa44d7ab572cee2262b70e/1080p/mp4/file.mp4" type="video/mp4" />
      </video>
      <div className="login-main-container">
        <div className="login-quote-side">
          <div className="login-quote-label">JOIN THE MUSIC</div>
          <div className="login-quote-title">Start Your<br/>Musical<br/>Journey</div>
          <div className="login-quote-desc">Create an account to explore a colorful world of music. A perfect musical journey awaits you.</div>
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

              <h2 className="auth-title-modern">Đăng ký</h2>
              <div className="auth-subtitle">
                Tạo tài khoản mới để bắt đầu
              </div>
              
              <form className="auth-form-modern" onSubmit={handleSubmit}>
                <div className="input-group-modern">
                  <label htmlFor="name" className="input-label-modern">Họ và tên</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Nhập họ và tên của bạn"
                    className="input-modern"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                  <label htmlFor="password" className="input-label-modern">Mật khẩu</label>
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

                <div className="input-group-modern">
                  <label htmlFor="confirmPassword" className="input-label-modern">Xác nhận mật khẩu</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="input-modern"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="terms-row">
                  <label className="remember-checkbox">
                    <input type="checkbox" required />
                    <span className="checkmark"></span>
                    Tôi đồng ý với- <Link to="/terms" className="terms-link">Điều khoản dịch vụ</Link>
                  </label>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <button type="submit" className="continue-btn">
                  Đăng ký
                </button>
                
                
                
                <div className="auth-switch-modern">
                  Đã có tài khoản? <Link to="/login" className="signup-link">Đăng nhập</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;