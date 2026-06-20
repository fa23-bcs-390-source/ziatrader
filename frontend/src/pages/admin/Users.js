import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import Spinner, { StatusBadge } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const ROLES = ['customer', 'agronomist', 'seller', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });

  const load = () => {
    adminAPI.getUsers({ search: search || undefined, role: roleFilter || undefined })
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'customer', phone: '' });
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditing(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '' });
    setShowForm(true);
  };

  const save = async () => {
    try {
      if (editing) {
        const payload = { name: form.name, email: form.email, role: form.role, phone: form.phone };
        const { data } = await adminAPI.updateUser(editing, payload);
        setUsers(prev => prev.map(u => u._id === editing ? data.user : u));
        toast.success('User updated');
      } else {
        if (!form.password) { toast.error('Password required for new user'); return; }
        const { data } = await adminAPI.createUser(form);
        setUsers(prev => [data.user, ...prev]);
        toast.success('User created');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const toggle = async (id) => {
    const { data } = await adminAPI.toggleUser(id);
    setUsers(prev => prev.map(u => u._id === id ? data.user : u));
    toast.success('User status updated');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await adminAPI.deleteUser(id);
    setUsers(prev => prev.filter(u => u._id !== id));
    toast.success('User deleted');
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header-flex">
        <h1 style={{ fontSize: '1.5rem' }}>Users ({users.length})</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="form-control" placeholder="🔍 Search..." style={{ width: 200 }} value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          <select className="form-control" style={{ width: 140 }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setTimeout(load, 0); }}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-4 mb-4">
          <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit User' : 'Create User'}</h3>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            {!editing && <div className="form-group"><label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>}
            <div className="form-group"><label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select></div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-responsive card">
        <table className="data-table">
          <thead>
            <tr>
              {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <img src={u.avatar} alt={u.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                    <strong style={{ fontSize: '0.875rem' }}>{u.name}</strong>
                  </div>
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{u.email}</td>
                <td><span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    {u.role !== 'admin' && (
                      <>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggle(u._id)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(u._id)}>Delete</button>
                      </>
                    )}
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
