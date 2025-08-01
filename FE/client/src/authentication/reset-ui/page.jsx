import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './resetui.css';

function ResetPasswordUI() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError(t('newPasswordsNoMatch', 'New passwords do not match'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('newPasswordMinLength', 'New password must be at least 6 characters'));
      return;
    }
    if (!token) {
      setError(t('missingToken', 'Missing or invalid token'));
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(t('resetSuccessRedirect', 'Password has been reset successfully. Redirecting to login...'));
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } else {
        setError(data.message || t('resetFailed', 'Failed to reset password'));
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
          <div className="auth-title" style={{ marginBottom: '0.7rem' }}>{t('resetPassword', 'Reset Password')}</div>
          <div className="auth-subtext" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', textAlign: 'center', fontWeight: 400 }}>
            {t('changePasswordPrompt', 'Enter your current password and new password below.')}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="newPassword" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('newPassword', 'New Password')}</label>
              <input
                id="newPassword"
                className="auth-input"
                type="password"
                name="newPassword"
                placeholder={t('newPasswordPlaceholder', 'Enter new password')}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="confirmPassword" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('confirmNewPassword', 'Confirm New Password')}</label>
              <input
                id="confirmPassword"
                className="auth-input"
                type="password"
                name="confirmPassword"
                placeholder={t('confirmNewPasswordPlaceholder', 'Confirm new password')}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
            <button className="auth-btn" type="submit">{t('resetPassword', 'Reset Password')}</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPasswordUI;
