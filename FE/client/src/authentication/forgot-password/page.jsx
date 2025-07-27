import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './forgot.css';

function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setEmail(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(t('resetLinkSent', 'Password reset link sent to your email.'));
      } else {
        setError(data.message || t('resetLinkFailed', 'Failed to send reset link'));
      }
    } catch (err) {
      setError(t('serverError', 'Server error'));
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-title" style={{ marginBottom: '0.7rem' }}>{t('forgotPassword', 'Forgot Password')}</div>
          <div className="auth-subtext" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', textAlign: 'center', fontWeight: 400 }}>
            {t('forgotPrompt', 'Enter your email to receive a password reset link.')}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="email" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('email')}</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                name="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
            <button className="auth-btn" type="submit">{t('sendResetLink', 'Send Reset Link')}</button>
          </form>
          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '0.6rem' }}>
            {t('rememberPassword', 'Remembered your password?')}
            <Link className="auth-link" to="/login">{t('logIn')}</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ForgotPassword;
