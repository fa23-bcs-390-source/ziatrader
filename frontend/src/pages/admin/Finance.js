import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Spinner, { PageHeader } from '../../components/common/Spinner';
import { financeAPI } from '../../utils/api';

const emptyForm = { date: '', type: 'income', category: '', description: '', amount: '' };

export default function AdminFinance() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, listRes] = await Promise.all([financeAPI.getSummary(), financeAPI.getAll()]);
      setSummary(sumRes.data.summary || { totalIncome: 0, totalExpense: 0, profit: 0 });
      setItems(listRes.data.transactions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(x =>
      [x.type, x.category, x.description].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [items, search]);

  const startEdit = (x) => {
    setEditingId(x._id);
    setForm({
      date: x.date ? new Date(x.date).toISOString().slice(0, 10) : '',
      type: x.type || 'income',
      category: x.category || '',
      description: x.description || '',
      amount: String(x.amount ?? ''),
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
    };

    try {
      if (editingId) {
        const { data } = await financeAPI.update(editingId, payload);
        setItems(prev => prev.map(i => (i._id === editingId ? data.transaction : i)));
        toast.success('Transaction updated');
      } else {
        const { data } = await financeAPI.create(payload);
        setItems(prev => [data.transaction, ...prev]);
        toast.success('Transaction created');
      }
      reset();
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await financeAPI.delete(id);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Transaction deleted');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Finance"
        subtitle="Simple income/expense ledger with totals."
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

      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Total Income</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>PKR {Number(summary.totalIncome || 0).toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Total Expense</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>PKR {Number(summary.totalExpense || 0).toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>Profit</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>PKR {Number(summary.profit || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={submit} className="grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
          <input className="form-control" type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
          <select className="form-control" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
          <input className="form-control" placeholder="Category" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
          <input className="form-control" placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          <input className="form-control" type="number" min="0" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {editingId && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
              {['Date', 'Type', 'Category', 'Amount', 'Description', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(x => (
              <tr key={x._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{x.date ? new Date(x.date).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize', fontWeight: 700 }}>{x.type}</td>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{x.category}</td>
                <td style={{ padding: '0.85rem 1rem' }}>PKR {Number(x.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '0.85rem 1rem', color: 'var(--gray-700)' }}>{x.description || '-'}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(x)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(x._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1.25rem', color: 'var(--gray-600)' }}>No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

