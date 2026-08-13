import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  if (!email) {
    // No email passed in (e.g. user navigated here directly) — send them back
    navigate('/register');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        login(data); // logs the user in immediately with returned token/role
        navigate('/');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('A new OTP has been sent to your email.');
      } else {
        setError(data.message || 'Could not resend OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const containerStyle = { maxWidth: '420px', margin: '60px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
  const inputStyle = { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #27272a', background: '#09090b', color: '#fff', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center' };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '10px', textAlign: 'center' }}>Verify Your Email</h2>
      <p style={{ color: '#a1a1aa', marginBottom: '25px', textAlign: 'center' }}>
        Enter the 6-digit code sent to <strong style={{ color: '#fff' }}>{email}</strong>
      </p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={inputStyle}
          maxLength={6}
          required
        />

        {error && <p style={{ color: '#ef4444', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: '#10b981', marginBottom: '15px', textAlign: 'center' }}>{message}</p>}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginBottom: '15px' }}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#a1a1aa' }}>
        Didn't receive the code?{' '}
        <span
          onClick={!resending ? handleResend : undefined}
          style={{ color: '#f97316', cursor: resending ? 'default' : 'pointer', fontWeight: 'bold' }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </span>
      </p>
    </div>
  );
};

export default VerifyOtp;