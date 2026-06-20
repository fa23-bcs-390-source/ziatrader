import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/agronomist-portal', icon: '📊', label: 'Dashboard' },
  { to: '/agronomist-portal/queries', icon: '❓', label: 'Queries' },
  { to: '/agronomist-portal/appointments', icon: '📅', label: 'Appointments' },
];

export default function AgronomistLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">🌿 Zia Traders</Link>
          <div className="admin-subtitle">Agronomist Portal</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`admin-nav-link ${isActive ? 'active' : ''}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <img src={user?.avatar} alt={user?.name} />
            <div>
              <div className="admin-user-name">{user?.name}</div>
              <div className="admin-user-role">Agronomist</div>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">🚪 Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
