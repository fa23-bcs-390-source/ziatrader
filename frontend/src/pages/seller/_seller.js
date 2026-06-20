// Seller Dashboard
import React, { useEffect, useState } from 'react';
import { sellerAPI, analyticsAPI } from '../../utils/api';
import Spinner, { StatusBadge } from '../../components/common/Spinner';
import { Link } from 'react-router-dom';

export function SellerDashboard() {
  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sellerAPI.getMyShop(), analyticsAPI.seller()])
      .then(([s, a]) => { setShop(s.data.shop); setStats(a.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Seller Dashboard</h1>
      {!shop ? (
        <div className="card p-4" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h2>Create Your Shop</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Set up your shop to start selling products on AgroMart Pro</p>
          <Link to="/seller/shop" className="btn btn-primary btn-lg">Create Shop →</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { icon: '📦', label: 'Total Products', value: stats?.totalProducts || 0 },
              { icon: '⭐', label: 'Top Product', value: stats?.topProducts?.[0]?.name || 'N/A' },
              { icon: '🏪', label: 'Shop Status', value: shop.isApproved ? 'Approved ✅' : 'Pending ⏳' },
            ].map((s, i) => (
              <div key={i} className="card p-3">
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{s.label}</p>
                <strong style={{ fontSize: '1.1rem', color: 'var(--green-800)' }}>{s.value}</strong>
              </div>
            ))}
          </div>
          <div className="card p-3 mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 56, height: 56, background: 'var(--green-100)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>🏪</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem' }}>{shop.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{shop.description?.slice(0, 100)}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <StatusBadge status={shop.isApproved ? 'approved' : 'pending'} />
                {shop.isVerified && <span className="badge badge-green">✅ Verified</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/seller/products" className="btn btn-primary">📦 Manage Products</Link>
            <Link to="/seller/orders" className="btn btn-secondary">🛒 View Orders</Link>
          </div>
        </>
      )}
    </div>
  );
}

// Seller Products
export function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', price:'', stock:'', category:'', unit:'bottle', cropTypes:[], brand:'', dosage:'' });

  useEffect(() => {
    const { categoryAPI } = require('../../utils/api');
    Promise.all([sellerAPI.getProducts(), categoryAPI.getAll()])
      .then(([p, c]) => { setProducts(p.data.products); setCategories(c.data.categories); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const { productAPI } = require('../../utils/api');
    try {
      const { data } = await productAPI.create({ ...form, price: +form.price, stock: +form.stock });
      setProducts(prev => [...prev, data.product]);
      setShowForm(false);
      setForm({ name:'', description:'', price:'', stock:'', category:'', unit:'bottle', cropTypes:[], brand:'', dosage:'' });
      const { default: toast } = require('react-hot-toast');
      toast.success('Product added! Pending admin approval.');
    } catch(err) { const { default: toast } = require('react-hot-toast'); toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>My Products ({products.length})</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Product'}</button>
      </div>
      {showForm && (
        <div className="card p-4 mb-3">
          <h3 style={{ marginBottom: '1.25rem' }}>Add New Product</h3>
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Product Name</label><input className="form-control" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Brand</label><input className="form-control" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-control" required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="">Select...</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Unit</label><select className="form-control" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>bottle</option><option>kg</option><option>litre</option><option>bag</option><option>packet</option></select></div>
              <div className="form-group"><label className="form-label">Price (PKR)</label><input className="form-control" type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Stock Quantity</label><input className="form-control" type="number" required value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Description</label><textarea className="form-control" rows={3} required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Dosage</label><input className="form-control" placeholder="e.g., 1ml per litre of water" value={form.dosage} onChange={e=>setForm({...form,dosage:e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit">Submit for Approval</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {products.length === 0 ? (
        <div className="card p-4" style={{ textAlign: 'center', color: 'var(--gray-500)' }}><p>No products yet. Add your first product!</p></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>{['Product','Category','Price','Stock','Status','Actions'].map(h=><th key={h} style={{padding:'0.85rem 1rem',textAlign:'left',fontSize:'0.78rem',fontWeight:700,color:'var(--gray-600)',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{padding:'0.85rem 1rem',fontWeight:600,fontSize:'0.875rem'}}>{p.name}</td>
                  <td style={{padding:'0.85rem 1rem',fontSize:'0.8rem'}}>{p.category?.name}</td>
                  <td style={{padding:'0.85rem 1rem',fontWeight:700,color:'var(--green-800)',fontSize:'0.875rem'}}>PKR {p.price?.toLocaleString()}</td>
                  <td style={{padding:'0.85rem 1rem',fontSize:'0.875rem',color:p.stock<=5?'#dc2626':'inherit'}}>{p.stock}</td>
                  <td style={{padding:'0.85rem 1rem'}}><span className={`badge ${p.isApproved?'badge-green':'badge-amber'}`}>{p.isApproved?'Approved':'Pending'}</span></td>
                  <td style={{padding:'0.85rem 1rem'}}><button className="btn btn-danger btn-sm" onClick={async()=>{const {productAPI}=require('../../utils/api');await productAPI.delete(p._id);setProducts(prev=>prev.filter(x=>x._id!==p._id));}}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Seller Orders
export function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { sellerAPI.getOrders().then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Orders ({orders.length})</h1>
      {orders.length === 0 ? <div className="card p-4 text-center"><p className="text-muted">No orders yet</p></div> : (
        <div>
          {orders.map(o => (
            <div key={o._id} className="card p-3 mb-2">
              <div className="flex-between">
                <div>
                  <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>{o.user?.name} • {new Date(o.createdAt).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {o.items?.map((item, i) => <span key={i} style={{ fontSize: '0.75rem', background: 'var(--gray-100)', padding: '0.2rem 0.5rem', borderRadius: 100 }}>{item.name} ×{item.quantity}</span>)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={o.orderStatus} />
                  <p style={{ fontWeight: 700, color: 'var(--green-800)', marginTop: '0.25rem' }}>PKR {o.totalAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Seller Shop Setup
export function SellerShop() {
  const [shop, setShop] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', phone: '', location: { city: '', state: '' } });
  const [loading, setLoading] = useState(true);

  useEffect(() => { sellerAPI.getMyShop().then(({ data }) => setShop(data.shop)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await sellerAPI.createShop(form);
      setShop(data.shop);
      const { default: toast } = require('react-hot-toast');
      toast.success('Shop created! Pending admin approval.');
    } catch(err) { const { default: toast } = require('react-hot-toast'); toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>🏪 My Shop</h1>
      {shop ? (
        <div className="card p-4">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 64, height: 64, background: 'var(--green-100)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🏪</div>
            <div>
              <h2>{shop.name}</h2>
              <p className="text-muted">{shop.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <span className={`badge ${shop.isApproved ? 'badge-green' : 'badge-amber'}`}>{shop.isApproved ? '✅ Approved' : '⏳ Pending Approval'}</span>
                {shop.isVerified && <span className="badge badge-green">🔵 Verified</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <h3 style={{ marginBottom: '1.25rem' }}>Create Your Shop</h3>
          <form onSubmit={submit}>
            <div className="form-group"><label className="form-label">Shop Name</label><input className="form-control" required placeholder="Al-Barkat Agro Store" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={3} placeholder="What do you sell?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" placeholder="03XX-XXXXXXX" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">City</label><input className="form-control" placeholder="Lahore" value={form.location.city} onChange={e=>setForm({...form,location:{...form.location,city:e.target.value}})} /></div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit">Create Shop</button>
          </form>
        </div>
      )}
    </div>
  );
}
