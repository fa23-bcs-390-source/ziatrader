import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',            icon: '📊', label: 'Dashboard' },
  { to: '/admin/users',      icon: '👥', label: 'Users' },
  { to: '/admin/products',   icon: '📦', label: 'Products' },
  { to: '/admin/orders',     icon: '🛒', label: 'Orders' },
  { to: '/admin/inventory',  icon: '📈', label: 'Inventory' },
  { to: '/admin/categories', icon: '🗂', label: 'Categories' },
  { to: '/admin/cms',        icon: '📝', label: 'CMS' },
  { to: '/admin/coupons',    icon: '🎟', label: 'Coupons' },
  { to: '/admin/warehouses', icon: '🏬', label: 'Warehouses' },
  { to: '/admin/logistics',  icon: '🚚', label: 'Logistics' },
  { to: '/admin/staff',      icon: '🧑‍💼', label: 'Staff' },
  { to: '/admin/expenses',   icon: '🧾', label: 'Expenses' },
  { to: '/admin/finance',    icon: '💳', label: 'Finance' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">🏪 Zia Traders & Co.</Link>
          <div className="admin-subtitle">Admin Panel</div>
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
              <div className="admin-user-role">Administrator</div>
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
