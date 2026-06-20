import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader, StatusBadge } from '../../components/common/Spinner';
import { staffAPI, warehouseAPI } from '../../utils/api';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  department: 'operations',
  position: 'staff',
  warehouse: '',
  salary: 0,
  joinDate: '',
  isActive: true,
};

export default function AdminStaff() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, whRes] = await Promise.all([staffAPI.getAll(), warehouseAPI.getAll()]);
      setItems(staffRes.data.staff || []);
      setWarehouses(whRes.data.warehouses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(s =>
      [s.name, s.email, s.phone, s.department, s.position, s.warehouse?.code, s.warehouse?.name]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name || '',
      email: s.email || '',
      phone: s.phone || '',
      department: s.department || 'operations',
      position: s.position || 'staff',
      warehouse: s.warehouse?._id || '',
      salary: Number(s.salary || 0),
      joinDate: s.joinDate ? new Date(s.joinDate).toISOString().slice(0, 10) : '',
      isActive: s.isActive !== false,
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');

    const payload = {
      ...form,
      salary: Number(form.salary || 0),
      warehouse: form.warehouse || undefined,
      joinDate: form.joinDate ? new Date(form.joinDate) : undefined,
    };

    try {
      if (editingId) {
        const { data } = await staffAPI.update(editingId, payload);
        setItems(prev => prev.map(x => (x._id === editingId ? data.staff : x)));
        toast.success('Staff updated');
      } else {
        const { data } = await staffAPI.create(payload);
        setItems(prev => [data.staff, ...prev]);
        toast.success('Staff created');
      }
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await staffAPI.delete(id);
      setItems(prev => prev.filter(x => x._id !== id));
      toast.success('Staff deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Staff (${items.length})`}
        subtitle="Manage internal staff records."
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
          <input className="form-control" placeholder="Email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="form-control" placeholder="Phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input className="form-control" placeholder="Department" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} />
          <input className="form-control" placeholder="Position" value={form.position} onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))} />
          <select className="form-control" value={form.warehouse} onChange={(e) => setForm(f => ({ ...f, warehouse: e.target.value }))}>
            <option value="">Warehouse (optional)</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
          </select>

          <input className="form-control" type="number" min="0" placeholder="Salary" value={form.salary} onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))} />
          <input className="form-control" type="date" value={form.joinDate} onChange={(e) => setForm(f => ({ ...f, joinDate: e.target.value }))} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', gridColumn: 'span 3' }}>
            {editingId && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Name', 'Contact', 'Role', 'Warehouse', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{s.name}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                  <div>{s.email || '-'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{s.phone || ''}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  <div style={{ textTransform: 'capitalize' }}>{s.department || '-'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{s.position || ''}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                  {s.warehouse ? `${s.warehouse.code} - ${s.warehouse.name}` : '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={s.isActive ? 'active' : 'inactive'} /></td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(s)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(s._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

