import React, { useEffect, useState } from 'react';
import { agronomistAPI } from '../../utils/api';
import Spinner, { StatusBadge } from '../../components/common/Spinner';
import toast from 'react-hot-toast';

export default function AgronomistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const load = () => {
    agronomistAPI.getConsultations()
      .then(({ data }) => setAppointments(data.consultations))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status, extra = {}) => {
    try {
      await agronomistAPI.updateConsultation(id, { status, ...extra });
      toast.success('Appointment updated');
      setRescheduleId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Appointments ({appointments.length})</h1>
      {appointments.length === 0 ? (
        <div className="card p-4 text-center"><p className="text-muted">No appointments yet.</p></div>
      ) : (
        <div className="table-responsive card">
          <table className="data-table">
            <thead>
              <tr>
                {['Customer', 'Issue', 'Scheduled', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a._id}>
                  <td>
                    <strong>{a.customer?.name}</strong>
                    <br /><small className="text-muted">{a.customer?.email}</small>
                  </td>
                  <td>{a.issue || a.cropType || '—'}</td>
                  <td>{a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '—'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>
                    <div className="action-buttons">
                      {a.status === 'requested' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>Confirm</button>
                      )}
                      {['requested', 'confirmed', 'rescheduled'].includes(a.status) && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => setRescheduleId(a._id)}>Reschedule</button>
                          <button className="btn btn-outline btn-sm" onClick={() => updateStatus(a._id, 'completed')}>Complete</button>
                        </>
                      )}
                    </div>
                    {rescheduleId === a._id && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <input type="datetime-local" className="form-control mb-1" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
                        <input className="form-control mb-1" placeholder="Reason for reschedule" value={rescheduleReason} onChange={e => setRescheduleReason(e.target.value)} />
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'rescheduled', { scheduledAt: rescheduleDate, rescheduleReason })}>Save</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
