import React, { useEffect, useState } from 'react';
import { queryAPI } from '../../utils/api';
import Spinner, { StatusBadge } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AgronomistQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');

  const load = () => {
    queryAPI.getMy()
      .then(({ data }) => setQueries(data.queries))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id) => {
    if (!response.trim()) { toast.error('Please enter a response'); return; }
    try {
      await queryAPI.respond(id, { response, status: 'resolved' });
      toast.success('Response sent!');
      setResponding(null);
      setResponse('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond');
    }
  };

  const updateStatus = async (id, status) => {
    await queryAPI.setStatus(id, { status });
    toast.success('Status updated');
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Customer Queries ({queries.length})</h1>
      {queries.length === 0 ? (
        <div className="card p-4 text-center"><p className="text-muted">No queries assigned yet.</p></div>
      ) : (
        queries.map(q => (
          <div key={q._id} className="card p-4 mb-3">
            <div className="query-header">
              <div>
                <h3 style={{ fontSize: '1rem' }}>{q.subject}</h3>
                <small className="text-muted">From: {q.customer?.name} ({q.customer?.email}) · {new Date(q.createdAt).toLocaleString()}</small>
              </div>
              <StatusBadge status={q.status} />
            </div>
            <p style={{ margin: '1rem 0', fontSize: '0.9rem' }}>{q.message}</p>
            {q.response && (
              <div style={{ background: 'var(--green-50)', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>
                <strong>Your response:</strong> {q.response}
              </div>
            )}
            {responding === q._id ? (
              <div>
                <textarea className="form-control mb-2" rows={3} value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..." />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleRespond(q._id)}>Send Response</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setResponding(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!q.response && <button className="btn btn-primary btn-sm" onClick={() => setResponding(q._id)}>Respond</button>}
                {q.status !== 'in_progress' && q.status !== 'resolved' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(q._id, 'in_progress')}>Mark In Progress</button>
                )}
                {q.status !== 'resolved' && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(q._id, 'resolved')}>Mark Resolved</button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
