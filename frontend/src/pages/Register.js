import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'customer' });
  const [err, setErr] = useState('');
  const handle = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await register(form);
      navigate('/');
    } catch(er) { setErr(er.response?.data?.message || 'Registration failed'); }
  };
  return (
    <div style={{ minHeight: '80vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--green-50)', padding: '2rem 1rem' }}>
      <div className="card p-4" style={{ width:'100%', maxWidth:460 }}>
        <div className="text-center mb-3">
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌱</div>
          <h2>Create Account</h2>
          <p className="text-muted">Join Pakistan's leading agro platform</p>
        </div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="Muhammad Ali" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="Min 6 characters" required minLength={6} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.75rem' }}>
              {['customer','seller','agronomist'].map(r => (
                <label key={r} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0.75rem', border:`2px solid ${form.role===r?'var(--green-600)':'var(--gray-200)'}`, borderRadius:'12px', cursor:'pointer', background: form.role===r?'var(--green-50)':'white', transition:'all 0.2s' }}>
                  <input type="radio" name="role" style={{display:'none'}} checked={form.role===r} onChange={()=>setForm({...form,role:r})} />
                  <span style={{fontSize:'1.5rem',marginBottom:'0.25rem'}}>{r==='customer'?'🛒':r==='seller'?'🏪':'👨‍🌾'}</span>
                  <span style={{fontSize:'0.8rem',fontWeight:600,textTransform:'capitalize',color:form.role===r?'var(--green-800)':'var(--gray-700)'}}>{r}</span>
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg mt-2" disabled={loading}>{loading?'Creating account...':'Create Account →'}</button>
        </form>
        <p className="text-center mt-3 text-muted">Already have an account? <Link to="/login" style={{color:'var(--green-700)',fontWeight:600}}>Login</Link></p>
      </div>
    </div>
  );
}
