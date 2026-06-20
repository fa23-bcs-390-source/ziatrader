import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { queryAPI, agronomistAPI } from '../../utils/api';
import Spinner from '../../components/common/Spinner';

export default function AgronomistDashboard() {
  const [queries, setQueries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([queryAPI.getMy(), agronomistAPI.getConsultations()])
      .then(([q, a]) => {
        setQueries(q.data.queries);
        setAppointments(a.data.consultations);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const openQueries = queries.filter(q => ['open', 'assigned', 'in_progress'].includes(q.status)).length;
  const pendingAppts = appointments.filter(a => ['requested', 'confirmed'].includes(a.status)).length;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Agronomist Dashboard</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Manage customer queries and appointments</p>
      <div className="grid-3 stats-cards">
        <div className="card p-4 stat-card">
          <div className="stat-card-value">{openQueries}</div>
          <div className="stat-card-label">Open Queries</div>
          <Link to="/agronomist-portal/queries" className="btn btn-sm btn-outline mt-2">View →</Link>
        </div>
        <div className="card p-4 stat-card">
          <div className="stat-card-value">{pendingAppts}</div>
          <div className="stat-card-label">Pending Appointments</div>
          <Link to="/agronomist-portal/appointments" className="btn btn-sm btn-outline mt-2">View →</Link>
        </div>
        <div className="card p-4 stat-card">
          <div className="stat-card-value">{appointments.filter(a => a.status === 'completed').length}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>
    </div>
  );
}
