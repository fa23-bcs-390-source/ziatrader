// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const handle = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const data = await login(form.email, form.password);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'seller') navigate('/seller/dashboard');
      else if (data.user.role === 'agronomist') navigate('/agronomist-portal');
      else navigate('/');
    } catch(e) { setErr(e.response?.data?.message || 'Login failed'); }
  };
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green-50)' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-3">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏪</div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Login to your Zia Traders & Co. account</p>
        </div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button className="btn btn-primary btn-block btn-lg mt-2" disabled={loading}>{loading ? 'Logging in...' : 'Login →'}</button>
        </form>
        <p className="text-center mt-3 text-muted">Don't have an account? <Link to="/register" style={{ color: 'var(--green-700)', fontWeight: 600 }}>Register here</Link></p>
        <div className="divider" />
        <p className="text-center" style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          Demo: admin@ziatraders.pk / 123456 | customer@ziatraders.pk / 123456
        </p>
      </div>
    </div>
  );
}
