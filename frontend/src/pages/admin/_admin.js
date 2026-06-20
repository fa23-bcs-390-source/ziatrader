// Categories
import React, { useEffect, useState } from 'react';
import { categoryAPI, couponAPI, adminAPI } from '../../utils/api';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { categoryAPI.getAll().then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const autoSlug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-');
    try {
      const { data } = await categoryAPI.create({ ...form, slug: autoSlug });
      setCategories(prev => [...prev, data.category]);
      setForm({ name: '', slug: '', description: '' });
      toast.success('Category created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete category?')) return;
    await categoryAPI.delete(id);
    setCategories(prev => prev.filter(c => c._id !== id));
    toast.success('Category deleted');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Categories ({categories.length})</h1>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                {['Name', 'Slug', 'Description', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--gray-600)' }}>{c.slug}</td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{c.description?.slice(0, 50) || '—'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c._id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-4">
        <h3 style={{ marginBottom: '1.25rem' }}>+ Add Category</h3>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Name</label><input className="form-control" placeholder="Pesticides" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Slug (optional)</label><input className="form-control" placeholder="auto-generated" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} placeholder="Short description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" type="submit">Create Category</button>
        </form>
      </div>
    </div>
  );
}

// Coupons
export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, expiryDate: '', usageLimit: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { couponAPI.getAll().then(({ data }) => setCoupons(data.coupons)).finally(() => setLoading(false)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await couponAPI.create(form);
      setCoupons(prev => [data.coupon, ...prev]);
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: 0, expiryDate: '', usageLimit: 100 });
      toast.success('Coupon created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const remove = async (id) => {
    await couponAPI.delete(id);
    setCoupons(prev => prev.filter(c => c._id !== id));
    toast.success('Coupon deleted');
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Coupons ({coupons.length})</h1>
        {coupons.length === 0 ? <p className="text-muted card p-3">No coupons created yet.</p> : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                  {['Code', 'Type', 'Value', 'Usage', 'Expiry', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}><span style={{ fontFamily: 'monospace', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-800)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>{c.code}</span></td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', textTransform: 'capitalize' }}>{c.discountType}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `PKR ${c.discountValue}`}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>{c.usageCount}/{c.usageLimit}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><button className="btn btn-danger btn-sm" onClick={() => remove(c._id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card p-4">
        <h3 style={{ marginBottom: '1.25rem' }}>🎟 Create Coupon</h3>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Coupon Code</label><input className="form-control" placeholder="SAVE20" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}><option value="percentage">Percentage (%)</option><option value="fixed">Fixed (PKR)</option></select></div>
            <div className="form-group"><label className="form-label">Value</label><input className="form-control" type="number" placeholder="20" required value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Min Order (PKR)</label><input className="form-control" type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Usage Limit</label><input className="form-control" type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Expiry Date</label><input className="form-control" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
          <button className="btn btn-primary btn-block">Create Coupon</button>
        </form>
      </div>
    </div>
  );
}

// Shops
export function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminAPI.getShops().then(({ data }) => setShops(data.shops)).finally(() => setLoading(false)); }, []);

  const approve = async (id) => {
    await adminAPI.approveShop(id);
    setShops(prev => prev.map(s => s._id === id ? { ...s, isApproved: true, isVerified: true } : s));
    toast.success('Shop approved!');
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shops ({shops.length})</h1>
      {shops.length === 0 ? <p className="text-muted card p-3">No shops registered yet.</p> : (
        <div className="grid-3">
          {shops.map(s => (
            <div key={s._id} className="card p-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏪</div>
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>{s.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{s.owner?.name} • {s.owner?.email}</p>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>{s.description?.slice(0, 80) || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${s.isApproved ? 'badge-green' : 'badge-amber'}`}>{s.isApproved ? '✅ Approved' : '⏳ Pending'}</span>
                {!s.isApproved && <button className="btn btn-secondary btn-sm" onClick={() => approve(s._id)}>Approve</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
