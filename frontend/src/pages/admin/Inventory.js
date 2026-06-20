import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader } from '../../components/common/Spinner';
import { inventoryAPI, productAPI, warehouseAPI } from '../../utils/api';

const emptyForm = { productId: '', warehouseId: '', delta: '', reason: 'manual', note: '' };

export default function AdminInventory() {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, totalStockUnits: 0, lowStockCount: 0, lowStockThreshold: 10 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [logRes, productRes, whRes] = await Promise.all([
        inventoryAPI.getLogs(),
        productAPI.getAll({ page: 1, limit: 200 }),
        warehouseAPI.getAll(),
      ]);
      setLogs(logRes.data.logs || []);
      setProducts(productRes.data.products || productRes.data?.data?.products || []);
      setWarehouses(whRes.data.warehouses || []);
      const summaryRes = await inventoryAPI.getSummary(10);
      setSummary(summaryRes.data.summary || { totalProducts: 0, totalStockUnits: 0, lowStockCount: 0, lowStockThreshold: 10 });
      setLowStockItems(summaryRes.data.lowStockItems || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      [l.product?.name, String(l.delta), l.reason, l.note, l.warehouse?.code, l.warehouse?.name]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [logs, search]);

  const adjust = async (e) => {
    e.preventDefault();
    if (!form.productId) return toast.error('Product is required');
    const deltaNum = Number(form.delta);
    if (!Number.isFinite(deltaNum) || deltaNum === 0) return toast.error('Delta must be a non-zero number');
    try {
      await inventoryAPI.adjust({
        productId: form.productId,
        warehouseId: form.warehouseId || undefined,
        delta: deltaNum,
        reason: form.reason || 'manual',
        note: form.note || undefined,
      });
      toast.success('Stock updated');
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Adjustment failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manual stock adjustments with an audit log."
        action={
          <input
            className="form-control"
            placeholder="Search logs"
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={adjust} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          <select className="form-control" value={form.productId} onChange={(e) => setForm(f => ({ ...f, productId: e.target.value }))}>
            <option value="">Product</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name} (stock: {p.stock})</option>)}
          </select>
          <select className="form-control" value={form.warehouseId} onChange={(e) => setForm(f => ({ ...f, warehouseId: e.target.value }))}>
            <option value="">Warehouse (optional)</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
          </select>
          <input className="form-control" type="number" step="1" placeholder="Delta (e.g. 5 or -2)" value={form.delta} onChange={(e) => setForm(f => ({ ...f, delta: e.target.value }))} />
          <input className="form-control" placeholder="Reason" value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))} />
          <input className="form-control" placeholder="Note" value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit">Apply</button>
          </div>
        </form>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Products Tracked</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{summary.totalProducts}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Total Units in Stock</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{summary.totalStockUnits}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Low Stock (≤ {summary.lowStockThreshold})</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{summary.lowStockCount}</div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Low Stock Alerts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {lowStockItems.slice(0, 8).map((item) => (
              <div key={item._id} style={{ padding: '0.6rem 0.75rem', border: '1px solid var(--gray-200)', borderRadius: 10 }}>
                <strong>{item.name}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Stock: {item.stock}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Time', 'Product', 'Warehouse', 'Delta', 'Reason', 'Note'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>
                  {l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{l.product?.name || '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>
                  {l.warehouse ? `${l.warehouse.code} - ${l.warehouse.name}` : '-'}
                </td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: l.delta >= 0 ? 'var(--green-800)' : 'var(--red-700)' }}>
                  {l.delta >= 0 ? `+${l.delta}` : l.delta}
                </td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{l.reason || '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{l.note || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

