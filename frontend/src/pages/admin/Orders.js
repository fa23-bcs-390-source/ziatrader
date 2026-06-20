import React, { useEffect, useState } from 'react';
import { adminAPI, orderAPI } from '../../utils/api';
import Spinner, { StatusBadge } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { adminAPI.getOrders().then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false)); }, []);

  const updateStatus = async (id, status) => {
    await orderAPI.updateStatus(id, { status });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
    toast.success(`Order marked as ${status}`);
  };

  const statuses = ['all','placed','confirmed','processing','shipped','delivered','cancelled'];
  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Orders ({orders.length})</h1>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700 }}>#{o._id.slice(-6).toUpperCase()}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem' }}>{o.user?.name}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>{o.items?.length} item(s)</td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--green-800)', fontSize: '0.875rem' }}>PKR {o.totalAmount?.toLocaleString()}</td>
                <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={o.paymentStatus} /></td>
                <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={o.orderStatus} /></td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <select className="form-control" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', width: 'auto' }}
                    value={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)}>
                    {['placed','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                      <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
