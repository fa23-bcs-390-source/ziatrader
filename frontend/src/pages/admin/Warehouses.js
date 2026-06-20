import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader, StatusBadge } from '../../components/common/Spinner';
import { warehouseAPI } from '../../utils/api';

const emptyForm = { name: '', code: '', city: '', state: '', address: '', capacityNotes: '', isActive: true };

export default function AdminWarehouses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await warehouseAPI.getAll();
      setItems(data.warehouses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(w =>
      [w.name, w.code, w.city, w.state].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  const startEdit = (w) => {
    setEditingId(w._id);
    setForm({
      name: w.name || '',
      code: w.code || '',
      city: w.city || '',
      state: w.state || '',
      address: w.address || '',
      capacityNotes: w.capacityNotes || '',
      isActive: w.isActive !== false,
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return toast.error('Name and Code are required');

    try {
      if (editingId) {
        const { data } = await warehouseAPI.update(editingId, form);
        setItems(prev => prev.map(x => (x._id === editingId ? data.warehouse : x)));
        toast.success('Warehouse updated');
      } else {
        const { data } = await warehouseAPI.create(form);
        setItems(prev => [data.warehouse, ...prev]);
        toast.success('Warehouse created');
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await warehouseAPI.delete(id);
      setItems(prev => prev.filter(x => x._id !== id));
      toast.success('Warehouse deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Warehouses (${items.length})`}
        subtitle="Manage warehouse master data."
        action={
          <input
            className="form-control"
            placeholder="Search"
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={submit} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          <input className="form-control" placeholder="Name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="form-control" placeholder="Code" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <input className="form-control" placeholder="City" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
          <input className="form-control" placeholder="State" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} />
          <input className="form-control" placeholder="Address" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
          <input className="form-control" placeholder="Capacity notes" value={form.capacityNotes} onChange={(e) => setForm(f => ({ ...f, capacityNotes: e.target.value }))} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', gridColumn: 'span 4' }}>
            {editingId && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Name', 'Code', 'Location', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{w.name}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', color: 'var(--gray-700)' }}>{w.code}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  {[w.city, w.state].filter(Boolean).join(', ') || '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={w.isActive ? 'active' : 'inactive'} /></td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(w)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(w._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No warehouses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

