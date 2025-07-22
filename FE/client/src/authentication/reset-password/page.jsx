import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import './reset.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = searchParams.get('token');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password has been reset successfully.');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-title" style={{ marginBottom: '0.7rem' }}>Reset Password</div>
          <div className="auth-subtext" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.6rem', textAlign: 'center', fontWeight: 400 }}>
            Enter your new password below.
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="password" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>New Password</label>
              <input
                id="password"
                className="auth-input"
                type="password"
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ width: '100%', marginBottom: '0.2rem' }}>
              <label htmlFor="confirmPassword" className="label-bold" style={{ color: '#444', marginBottom: '0.2rem', display: 'block', textAlign: 'left' }}>Confirm Password</label>
              <input
                id="confirmPassword"
                className="auth-input"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
            <button className="auth-btn" type="submit">Reset Password</button>
          </form>
          <div className="auth-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '0.6rem' }}>
            Back to
            <Link className="auth-link" to="/login">Log In</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPassword;
