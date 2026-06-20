import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader, StatusBadge } from '../../components/common/Spinner';
import { adminAPI, logisticsAPI, warehouseAPI } from '../../utils/api';

const emptyForm = {
  order: '',
  carrier: '',
  trackingNumber: '',
  status: 'created',
  fromWarehouse: '',
  toCity: '',
  toState: '',
  toStreet: '',
  toZip: '',
  toPhone: '',
  notes: '',
};

export default function AdminLogistics() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [shipRes, orderRes, whRes] = await Promise.all([
        logisticsAPI.getAll(),
        adminAPI.getOrders(),
        warehouseAPI.getAll(),
      ]);
      setItems(shipRes.data.shipments || []);
      setOrders(orderRes.data.orders || []);
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
      [s.trackingNumber, s.carrier, s.status, s.order?._id, s.fromWarehouse?.code, s.fromWarehouse?.name]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  const create = async (e) => {
    e.preventDefault();
    if (!form.order) return toast.error('Order is required');
    try {
      const payload = {
        order: form.order,
        carrier: form.carrier || undefined,
        trackingNumber: form.trackingNumber || undefined,
        status: form.status || 'created',
        fromWarehouse: form.fromWarehouse || undefined,
        toAddress: {
          street: form.toStreet || undefined,
          city: form.toCity || undefined,
          state: form.toState || undefined,
          zip: form.toZip || undefined,
          phone: form.toPhone || undefined,
        },
        notes: form.notes || undefined,
      };
      const { data } = await logisticsAPI.create(payload);
      setItems(prev => [data.shipment, ...prev]);
      setForm(emptyForm);
      toast.success('Shipment created');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await logisticsAPI.updateStatus(id, { status });
      setItems(prev => prev.map(s => (s._id === id ? data.shipment : s)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try {
      await logisticsAPI.delete(id);
      setItems(prev => prev.filter(s => s._id !== id));
      toast.success('Shipment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Logistics (${items.length})`}
        subtitle="Create shipments and track delivery status."
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
        <form onSubmit={create} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          <select className="form-control" value={form.order} onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}>
            <option value="">Order</option>
            {orders.map(o => (
              <option key={o._id} value={o._id}>
                {o._id.slice(-8).toUpperCase()} — {o.orderStatus} — PKR {Number(o.totalAmount || 0).toLocaleString()}
              </option>
            ))}
          </select>
          <select className="form-control" value={form.fromWarehouse} onChange={(e) => setForm(f => ({ ...f, fromWarehouse: e.target.value }))}>
            <option value="">From Warehouse (optional)</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
          </select>
          <input className="form-control" placeholder="Carrier" value={form.carrier} onChange={(e) => setForm(f => ({ ...f, carrier: e.target.value }))} />
          <input className="form-control" placeholder="Tracking Number" value={form.trackingNumber} onChange={(e) => setForm(f => ({ ...f, trackingNumber: e.target.value }))} />
          <select className="form-control" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
            {['created', 'picked', 'in_transit', 'delivered', 'cancelled', 'returned'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input className="form-control" placeholder="Notes" value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />

          <input className="form-control" placeholder="To Street" value={form.toStreet} onChange={(e) => setForm(f => ({ ...f, toStreet: e.target.value }))} />
          <input className="form-control" placeholder="To City" value={form.toCity} onChange={(e) => setForm(f => ({ ...f, toCity: e.target.value }))} />
          <input className="form-control" placeholder="To State" value={form.toState} onChange={(e) => setForm(f => ({ ...f, toState: e.target.value }))} />
          <input className="form-control" placeholder="To Zip" value={form.toZip} onChange={(e) => setForm(f => ({ ...f, toZip: e.target.value }))} />
          <input className="form-control" placeholder="To Phone" value={form.toPhone} onChange={(e) => setForm(f => ({ ...f, toPhone: e.target.value }))} />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', gridColumn: 'span 1' }}>
            <button className="btn btn-primary" type="submit">Create</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Order', 'Carrier', 'Tracking', 'Warehouse', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                  {s.order?._id ? s.order._id.slice(-8).toUpperCase() : '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{s.carrier || '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{s.trackingNumber || '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>
                  {s.fromWarehouse ? `${s.fromWarehouse.code} - ${s.fromWarehouse.name}` : '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={s.status} /></td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select className="form-control" style={{ width: 160 }} value={s.status} onChange={(e) => updateStatus(s._id, e.target.value)}>
                      {['created', 'picked', 'in_transit', 'delivered', 'cancelled', 'returned'].map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(s._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No shipments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

