import React, { useEffect, useState } from 'react';
import { adminAPI, productAPI, categoryAPI } from '../../utils/api';
import Spinner, { StarRating, StatusBadge } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const emptyProduct = {
  name: '', description: '', price: '', discountedPrice: '', category: '',
  subcategory: '', brand: '', sku: '', stock: '', images: [''], tags: '',
  specifications: [{ key: '', value: '' }], isFeatured: false, isActive: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);

  const load = () => {
    Promise.all([
      adminAPI.getProducts({ search: search || undefined }),
      categoryAPI.getAll(),
    ])
      .then(([p, c]) => {
        setProducts(p.data.products);
        setCategories(c.data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name, description: p.description, price: p.price,
      discountedPrice: p.discountedPrice || '', category: p.category?._id || p.category || '',
      subcategory: p.subcategory || '', brand: p.brand || '', sku: p.sku || '',
      stock: p.stock, images: p.images?.length ? p.images : [''],
      tags: p.tags?.join(', ') || '',
      specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }],
      isFeatured: p.isFeatured, isActive: p.isActive,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price, and category are required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      stock: Number(form.stock) || 0,
      images: form.images.filter(Boolean),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      specifications: form.specifications.filter(s => s.key && s.value),
      isApproved: true,
    };
    try {
      if (editing) {
        await productAPI.update(editing, payload);
        toast.success('Product updated');
      } else {
        await productAPI.create(payload);
        toast.success('Product created');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const approve = async (id) => {
    await adminAPI.approveProduct(id);
    setProducts(prev => prev.map(p => p._id === id ? { ...p, isApproved: true } : p));
    toast.success('Product approved!');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await productAPI.delete(id);
    setProducts(prev => prev.filter(p => p._id !== id));
    toast.success('Product deleted');
  };

  const bulkDelete = async () => {
    if (!selected.length || !window.confirm(`Delete ${selected.length} products?`)) return;
    await Promise.all(selected.map(id => productAPI.delete(id)));
    setSelected([]);
    load();
    toast.success('Bulk delete complete');
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-flex">
        <h1 style={{ fontSize: '1.5rem' }}>Products ({products.length})</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="form-control" placeholder="🔍 Search..." style={{ width: 200 }} value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          {selected.length > 0 && <button className="btn btn-danger btn-sm" onClick={bulkDelete}>Delete ({selected.length})</button>}
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-4 mb-4">
          <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit Product' : 'Create Product'}</h3>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Product Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">SKU</label>
              <input className="form-control" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Brand</label>
              <input className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Subcategory</label>
              <input className="form-control" value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Price (PKR) *</label>
              <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Discount Price</label>
              <input type="number" className="form-control" value={form.discountedPrice} onChange={e => setForm({ ...form, discountedPrice: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Quantity / Stock *</label>
              <input type="number" className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Image URL</label>
              <input className="form-control" value={form.images[0]} onChange={e => setForm({ ...form, images: [e.target.value] })} /></div>
            <div className="form-group"><label className="form-label">Tags (comma separated)</label>
              <input className="form-control" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="form-label">Description *</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
            <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-responsive card">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? products.map(p => p._id) : [])} /></th>
              {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} /></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img src={p.images?.[0] || 'https://placehold.co/40x40/e8eef5/1e3a5f?text=P'} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{p.category?.name}</td>
                <td style={{ fontWeight: 600, color: 'var(--green-800)' }}>PKR {p.price?.toLocaleString()}</td>
                <td><span style={{ color: p.stock <= 5 ? '#dc2626' : p.stock <= 10 ? '#d97706' : 'var(--green-700)', fontWeight: 600 }}>{p.stock}</span></td>
                <td><StarRating rating={p.ratings} /></td>
                <td><StatusBadge status={p.isApproved ? (p.isActive ? 'active' : 'inactive') : 'pending'} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    {!p.isApproved && <button className="btn btn-secondary btn-sm" onClick={() => approve(p._id)}>Approve</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
