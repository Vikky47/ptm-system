// pages/admin/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        document.cookie = `adminToken=${data.token}; path=/; max-age=86400`;
        localStorage.setItem('adminToken', data.token);
        router.push('/admin');
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'var(--brand)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            fontSize: '28px'
          }}>🎓</div>
          <h1 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
            PTM Admin Panel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Aakash Institute — 2025
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--dark)' }}>
            Sign In
          </h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label className="label">Admin Password</label>
              <input
                type="password"
                className={`input ${error ? 'error' : ''}`}
                placeholder="Enter password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoFocus
              />
              {error && (
                <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '6px' }}>
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spin" style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', display: 'inline-block'
                  }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '24px' }}>
          PTM Attendance & Feedback System v1.0
        </p>
      </div>
    </div>
  );
}
