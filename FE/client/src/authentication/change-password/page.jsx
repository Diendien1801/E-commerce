import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../components/context/authcontext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './change.css';

function ChangePassword() {
  const { t, i18n } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError(t('newPasswordsNoMatch', 'New passwords do not match'));
      return;
    }
    const userId = user?._id || user?.userId || user?.id;
    try {
      const response = await fetch('http://localhost:5000/api/users/changepass', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ _id: userId, currentPassword, newPassword })
      });
      console.log(response);
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(t('passwordChanged', 'Password changed successfully.'));
        setTimeout(() => {
          navigate("/profile/" + userId);
        }, 1200);
      } else {
        setError(data.message || t('changePasswordFailed', 'Failed to change password'));
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
          <div className="auth-title" style={{ marginBottom: '0.7rem' }}>{t('changePassword', 'Change Password')}</div>
          <div className="auth-subtext" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', textAlign: 'center', fontWeight: 400 }}>
            {t('changePasswordPrompt', 'Enter your current password and new password below.')}
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="currentPassword" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>{t('currentPassword', 'Current Password')}</label>
              <input
                id="currentPassword"
                className="auth-input"
                type="password"
                name="currentPassword"
                placeholder={t('currentPasswordPlaceholder', 'Enter current password')}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>
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
            <button className="auth-btn" type="submit">{t('changePassword', 'Change Password')}</button>
          </form>
          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '0.6rem' }}>
            {t('backTo', 'Back to')}
            <Link className="auth-link" to={"/profile/" + (user?._id || user?.userId || user?.id)}>{t('profile', 'Profile')}</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ChangePassword;
