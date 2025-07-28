import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
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
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        alert(t('registerSuccess'));
        navigate('/');
      } else {
        setError(data.message || t('registerFailed'));
      }
    } catch (err) {
      setError(t('serverError'));
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-title" style={{ marginBottom: '0.7rem' }}>{t('signUp')}</div>
          <div className="auth-subtext" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', textAlign: 'center', fontWeight: 400 }}>
            {t('registerPrompt')}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="name" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('name')}</label>
              <input
                id="name"
                className="auth-input"
                type="text"
                name="name"
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="email" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('email')}</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                name="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="password" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('password')}</label>
              <input
                id="password"
                className="auth-input"
                type="password"
                name="password"
                placeholder={t('passwordPlaceholder')}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="confirmPassword" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('confirmPassword')}</label>
              <input
                id="confirmPassword"
                className="auth-input"
                type="password"
                name="confirmPassword"
                placeholder={t('confirmPasswordPlaceholder')}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <button className="auth-btn" type="submit">{t('signUp')}</button>
          </form>
          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '0.6rem' }}>
            {t('alreadyHaveAccount')}
            <Link className="auth-link" to="/login">{t('logIn')}</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;
