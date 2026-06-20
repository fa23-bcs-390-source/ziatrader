import React, { useEffect, useState } from 'react';
import { queryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner, { StatusBadge } from '../components/common/Spinner';
import toast from 'react-hot-toast';

export default function Queries() {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    queryAPI.getMy()
      .then(({ data }) => setQueries(data.queries))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      await queryAPI.create(form);
      toast.success('Query submitted successfully!');
      setForm({ subject: '', message: '', priority: 'medium' });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const statusColors = { open: 'pending', assigned: 'processing', in_progress: 'processing', resolved: 'approved', closed: 'inactive' };

  if (loading) return <div className="container section"><Spinner /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div className="page-header-flex">
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>My Queries</h1>
          <p className="text-muted">Submit and track your support queries</p>
        </div>
        {user?.role === 'customer' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Query'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card p-4 mb-4" onSubmit={submit}>
          <h3 style={{ marginBottom: '1rem' }}>Submit a Query</h3>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="What do you need help with?" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-control" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your question in detail..." />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      )}

      {queries.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="text-muted">No queries yet. Submit one to get help from our team.</p>
        </div>
      ) : (
        <div className="queries-list">
          {queries.map(q => (
            <div key={q._id} className="card p-4 mb-3">
              <div className="query-header">
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{q.subject}</h3>
                  <small className="text-muted">{new Date(q.createdAt).toLocaleString()}</small>
                </div>
                <StatusBadge status={statusColors[q.status] || q.status} />
              </div>
              <p style={{ margin: '1rem 0', fontSize: '0.9rem' }}>{q.message}</p>
              {q.response && (
                <div style={{ background: 'var(--green-50)', padding: '1rem', borderRadius: 8, borderLeft: '3px solid var(--green-700)' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--green-800)' }}>Response from {q.agronomist?.name || 'Support Team'}:</strong>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{q.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
