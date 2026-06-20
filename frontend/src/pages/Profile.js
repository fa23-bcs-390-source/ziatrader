import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [newAddr, setNewAddr] = useState({ label:'Home', street:'', city:'', state:'', zip:'' });

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const addAddr = async (e) => {
    e.preventDefault();
    try {
      const { data } = await userAPI.addAddress(newAddr);
      updateUser({ addresses: data.addresses });
      setNewAddr({ label:'Home', street:'', city:'', state:'', zip:'' });
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const tabs = ['profile','security','addresses'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>My Profile</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.65rem 1.25rem', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize', color: tab === t ? 'var(--green-800)' : 'var(--gray-500)', borderBottom: tab === t ? '2px solid var(--green-700)' : '2px solid transparent', marginBottom: '-2px' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-4" style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src={user?.avatar} alt={user?.name} style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--green-400)' }} />
            <div>
              <h3>{user?.name}</h3>
              <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{user?.email}</p>
            </div>
          </div>
          <form onSubmit={saveProfile}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Phone Number</label><input className="form-control" placeholder="+92-300-0000000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
            <button className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-4" style={{ maxWidth: 500 }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Change Password</h3>
          <form onSubmit={async (e) => {
            e.preventDefault(); setSaving(true);
            try { const { authAPI } = await import('../utils/api'); await authAPI.updatePassword(pwForm); toast.success('Password updated!'); setPwForm({ currentPassword:'', newPassword:'' }); }
            catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
            finally { setSaving(false); }
          }}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-control" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-control" type="password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} /></div>
            <button className="btn btn-primary" disabled={saving}>{saving?'Updating...':'Update Password'}</button>
          </form>
        </div>
      )}

      {tab === 'addresses' && (
        <div>
          <div className="grid-2 mb-3">
            {user?.addresses?.map((a) => (
              <div key={a._id} className="card p-3">
                <div className="flex-between mb-1">
                  <span className="badge badge-green">{a.label}</span>
                  <button className="btn btn-danger btn-sm" onClick={async () => { await userAPI.deleteAddress(a._id); updateUser({ addresses: user.addresses.filter(x => x._id !== a._id) }); toast.success('Address removed'); }}>Remove</button>
                </div>
                <p style={{ fontSize: '0.875rem' }}>{a.street}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{a.city}, {a.state} {a.zip}</p>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <h3 style={{ marginBottom: '1.25rem' }}>Add New Address</h3>
            <form onSubmit={addAddr}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Label</label><select className="form-control" value={newAddr.label} onChange={e=>setNewAddr({...newAddr,label:e.target.value})}><option>Home</option><option>Farm</option><option>Office</option><option>Other</option></select></div>
                <div className="form-group"><label className="form-label">City</label><input className="form-control" placeholder="Lahore" value={newAddr.city} onChange={e=>setNewAddr({...newAddr,city:e.target.value})} /></div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Street Address</label><input className="form-control" placeholder="House #, Street, Area" value={newAddr.street} onChange={e=>setNewAddr({...newAddr,street:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Province</label><input className="form-control" placeholder="Punjab" value={newAddr.state} onChange={e=>setNewAddr({...newAddr,state:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-control" placeholder="54000" value={newAddr.zip} onChange={e=>setNewAddr({...newAddr,zip:e.target.value})} /></div>
              </div>
              <button className="btn btn-primary" type="submit">Add Address</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
