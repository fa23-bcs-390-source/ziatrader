import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader } from '../../components/common/Spinner';
import { expenseAPI, staffAPI, warehouseAPI } from '../../utils/api';

const emptyForm = {
  date: '',
  category: '',
  description: '',
  amount: '',
  paymentMethod: 'cash',
  referenceNo: '',
  warehouse: '',
  staff: '',
};

export default function AdminExpenses() {
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [expRes, staffRes, whRes] = await Promise.all([expenseAPI.getAll(), staffAPI.getAll(), warehouseAPI.getAll()]);
      setItems(expRes.data.expenses || []);
      setStaff(staffRes.data.staff || []);
      setWarehouses(whRes.data.warehouses || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(x =>
      [x.category, x.description, x.paymentMethod, x.referenceNo, x.warehouse?.code, x.warehouse?.name, x.staff?.name]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  const startEdit = (x) => {
    setEditingId(x._id);
    setForm({
      date: x.date ? new Date(x.date).toISOString().slice(0, 10) : '',
      category: x.category || '',
      description: x.description || '',
      amount: String(x.amount ?? ''),
      paymentMethod: x.paymentMethod || 'cash',
      referenceNo: x.referenceNo || '',
      warehouse: x.warehouse?._id || '',
      staff: x.staff?._id || '',
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category.trim()) return toast.error('Category is required');
    const amountNum = Number(form.amount);
    if (!Number.isFinite(amountNum) || amountNum < 0) return toast.error('Valid amount is required');

    const payload = {
      ...form,
      amount: amountNum,
      date: form.date ? new Date(form.date) : undefined,
      warehouse: form.warehouse || undefined,
      staff: form.staff || undefined,
    };

    try {
      if (editingId) {
        const { data } = await expenseAPI.update(editingId, payload);
        setItems(prev => prev.map(i => (i._id === editingId ? data.expense : i)));
        toast.success('Expense updated');
      } else {
        const { data } = await expenseAPI.create(payload);
        setItems(prev => [data.expense, ...prev]);
        toast.success('Expense created');
      }
      reset();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Expense deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Expenses (${items.length})`}
        subtitle="Record and track operational expenses."
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
          <input className="form-control" type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
          <input className="form-control" placeholder="Category" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
          <input className="form-control" placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="form-control" type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
          <select className="form-control" value={form.paymentMethod} onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            {['cash', 'bank', 'card', 'other'].map(x => <option key={x} value={x}>{x}</option>)}
          </select>
          <input className="form-control" placeholder="Reference No" value={form.referenceNo} onChange={(e) => setForm(f => ({ ...f, referenceNo: e.target.value }))} />

          <select className="form-control" value={form.warehouse} onChange={(e) => setForm(f => ({ ...f, warehouse: e.target.value }))}>
            <option value="">Warehouse (optional)</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.code} - {w.name}</option>)}
          </select>
          <select className="form-control" value={form.staff} onChange={(e) => setForm(f => ({ ...f, staff: e.target.value }))}>
            <option value="">Staff (optional)</option>
            {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

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
              {['Date', 'Category', 'Amount', 'Warehouse', 'Staff', 'Method', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(x => (
              <tr key={x._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>{x.date ? new Date(x.date).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{x.category}</td>
                <td style={{ padding: '0.85rem 1rem', fontSize: '0.9rem' }}>PKR {Number(x.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{x.warehouse ? `${x.warehouse.code} - ${x.warehouse.name}` : '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{x.staff?.name || '-'}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{x.paymentMethod || '-'}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(x)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(x._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No expenses found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

