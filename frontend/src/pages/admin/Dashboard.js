import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../utils/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Spinner from '../../components/common/Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const StatCard = ({ icon, label, value, color = 'var(--green-800)' }) => (
  <div className="card p-3">
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.2rem' }}>{label}</p>
        <strong style={{ fontSize: '1.5rem', fontFamily: 'Syne, sans-serif', color }}>{value}</strong>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.admin()
      .then(({ data }) => { setStats(data.stats); setMonthly(data.monthlySales); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const revenueData = {
    labels: monthly.map(m => months[m._id.month - 1]),
    datasets: [{ label: 'Revenue (PKR)', data: monthly.map(m => m.revenue), backgroundColor: 'rgba(45,106,79,0.8)', borderColor: 'var(--green-700)', borderWidth: 2, borderRadius: 6 }],
  };
  const ordersData = {
    labels: monthly.map(m => months[m._id.month - 1]),
    datasets: [{ label: 'Orders', data: monthly.map(m => m.count), fill: true, backgroundColor: 'rgba(82,183,136,0.15)', borderColor: 'var(--green-600)', tension: 0.4, pointBackgroundColor: 'var(--green-600)' }],
  };
  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Welcome back! Here's what's happening at Zia Traders & Co.</p>
      </div>

      <div className="grid-4 mb-3">
        <StatCard icon="👥" label="Total Users"    value={stats?.totalUsers?.toLocaleString() || 0} color="var(--green-800)" />
        <StatCard icon="📦" label="Total Orders"   value={stats?.totalOrders?.toLocaleString() || 0} color="#7c3aed" />
        <StatCard icon="🌿" label="Total Products" value={stats?.totalProducts?.toLocaleString() || 0} color="#0369a1" />
        <StatCard icon="💰" label="Revenue (PKR)"  value={`${Math.round((stats?.revenue || 0) / 1000)}K`} color="#b45309" />
      </div>

      <div className="grid-2 mb-3">
        <div className="card p-3">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>📊 Monthly Revenue</h3>
          {monthly.length > 0 ? <Bar data={revenueData} options={chartOptions} /> : <p className="text-muted">No data yet</p>}
        </div>
        <div className="card p-3">
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>📈 Order Trends</h3>
          {monthly.length > 0 ? <Line data={ordersData} options={chartOptions} /> : <p className="text-muted">No data yet</p>}
        </div>
      </div>

      <div className="card p-3">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[['👤 Manage Users', '/admin/users'], ['📦 Pending Products', '/admin/products'], ['🛒 All Orders', '/admin/orders'], ['🗂 Categories', '/admin/categories'], ['🎟 Coupons', '/admin/coupons'], ['🏪 Shops', '/admin/shops']].map(([label, href]) => (
            <a key={href} href={href} className="btn btn-secondary btn-sm">{label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
